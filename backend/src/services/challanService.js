import { supabase } from '../config/supabase.js';
import { NotFoundError, AppError, ConflictError } from '../utils/errors.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';
import { DEFAULT_PAGE_SIZE } from '../config/constants.js';

export class ChallanService {
  async _generateChallanNumber() {
    const year = new Date().getFullYear();
    const prefix = `CH-${year}-`;

    const { data, error } = await supabase
      .from('sales_challans')
      .select('challan_number')
      .like('challan_number', `${prefix}%`)
      .order('challan_number', { ascending: false })
      .limit(1);

    if (error) throw new AppError('Failed to generate challan number', 500);

    let nextNum = 1;
    if (data && data.length > 0) {
      const lastNum = parseInt(data[0].challan_number.split('-').pop(), 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }

    return `${prefix}${String(nextNum).padStart(5, '0')}`;
  }

  async list({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '', status = '' }) {
    const { page: p, pageSize: ps, from, to } = paginate(page, pageSize);

    let query = supabase
      .from('sales_challans')
      .select('id, challan_number, customer_id, status, total_quantity, created_by, created_at, customers(id, name, mobile, email)', { count: 'exact' });

    if (search) {
      query = query.or(`challan_number.ilike.%${search}%`);
    }
    if (status) query = query.eq('status', status);

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw new AppError('Failed to fetch challans', 500);

    return {
      data,
      meta: buildPaginationMeta(count || 0, p, ps),
    };
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('sales_challans')
      .select('id, challan_number, customer_id, status, total_quantity, created_by, created_at, customers(id, name, mobile, email, business_name, gst_number, address)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new AppError('Failed to fetch challan', 500);
    if (!data) throw new NotFoundError('Challan');

    const { data: items, error: itemsError } = await supabase
      .from('sales_challan_items')
      .select('id, product_id, product_snapshot, quantity, unit_price, created_at, products(id, name, sku, unit_price)')
      .eq('challan_id', id)
      .order('created_at', { ascending: true });

    if (itemsError) throw new AppError('Failed to fetch challan items', 500);

    return { ...data, items: items || [] };
  }

  async create({ customer_id, items }, userId) {
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customer_id)
      .maybeSingle();

    if (custError) throw new AppError('Failed to verify customer', 500);
    if (!customer) throw new NotFoundError('Customer');

    const productIds = items.map((i) => i.product_id);
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, sku, category, unit_price, current_stock, warehouse_location')
      .in('id', productIds);

    if (prodError) throw new AppError('Failed to fetch products', 500);

    if (products.length !== productIds.length) {
      throw new NotFoundError('One or more products');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
    const challanNumber = await this._generateChallanNumber();

    const { data: challan, error: challanError } = await supabase
      .from('sales_challans')
      .insert({
        challan_number: challanNumber,
        customer_id,
        status: 'draft',
        total_quantity: totalQuantity,
        created_by: userId,
      })
      .select()
      .single();

    if (challanError) throw new AppError('Failed to create challan', 500);

    const itemRows = items.map((i) => {
      const product = productMap.get(i.product_id);
      return {
        challan_id: challan.id,
        product_id: i.product_id,
        product_snapshot: {
          name: product.name,
          sku: product.sku,
          category: product.category,
          unit_price: product.unit_price,
          warehouse_location: product.warehouse_location,
        },
        quantity: i.quantity,
        unit_price: product.unit_price,
      };
    });

    const { error: itemsError } = await supabase
      .from('sales_challan_items')
      .insert(itemRows);

    if (itemsError) throw new AppError('Failed to create challan items', 500);

    return this.getById(challan.id);
  }

  async updateStatus(id, status, userId) {
    const challan = await this.getById(id);

    if (challan.status === 'confirmed' && status === 'confirmed') {
      throw new ConflictError('Challan is already confirmed');
    }
    if (challan.status === 'cancelled') {
      throw new ConflictError('Cannot update a cancelled challan');
    }
    if (challan.status === 'confirmed' && status === 'cancelled') {
      throw new ConflictError('Cannot cancel a confirmed challan');
    }

    if (status === 'confirmed') {
      for (const item of challan.items) {
        const { data: product, error } = await supabase
          .from('products')
          .select('id, current_stock')
          .eq('id', item.product_id)
          .maybeSingle();

        if (error) throw new AppError('Failed to verify stock', 500);
        if (!product) throw new NotFoundError('Product');

        if (product.current_stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product ${item.product_snapshot.name || item.product_id}. Available: ${product.current_stock}, Required: ${item.quantity}`,
            400,
            { product_id: item.product_id, available: product.current_stock, required: item.quantity }
          );
        }
      }

      for (const item of challan.items) {
        const { data: product } = await supabase
          .from('products')
          .select('current_stock')
          .eq('id', item.product_id)
          .maybeSingle();

        const newStock = product.current_stock - item.quantity;

        const { error: stockError } = await supabase
          .from('stock_movements')
          .insert({
            product_id: item.product_id,
            quantity_changed: item.quantity,
            movement_type: 'OUT',
            reason: `Challan ${challan.challan_number}`,
            created_by: userId,
          });

        if (stockError) throw new AppError('Failed to log stock movement', 500);

        const { error: updateError } = await supabase
          .from('products')
          .update({ current_stock: newStock })
          .eq('id', item.product_id);

        if (updateError) throw new AppError('Failed to update stock', 500);
      }
    }

    const { data, error } = await supabase
      .from('sales_challans')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('Failed to update challan status', 500);

    return this.getById(id);
  }
}

export const challanService = new ChallanService();
