import { supabase } from '../config/supabase.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';
import { DEFAULT_PAGE_SIZE } from '../config/constants.js';

export class ProductService {
  async list({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '', category = '', lowStock = false }) {
    const { page: p, pageSize: ps, from, to } = paginate(page, pageSize);

    let query = supabase
      .from('products')
      .select('id, name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, created_by, created_at, updated_at', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }
    if (category) query = query.eq('category', category);

    query = query.order('created_at', { ascending: false });

    // If lowStock is true, do NOT paginate yet so we can filter all products
    if (!lowStock) {
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw new AppError('Failed to fetch products', 500);

    let products = data || [];
    let finalCount = count || 0;

    if (lowStock) {
      products = products.filter((prod) => prod.current_stock <= prod.minimum_stock);
      finalCount = products.length;
      // Apply pagination in memory
      products = products.slice(from, to + 1);
    }

    let totalStock = 0;
    const { data: stockData } = await supabase.from('products').select('current_stock');
    if (stockData) {
      totalStock = stockData.reduce((acc, curr) => acc + (curr.current_stock || 0), 0);
    }

    const meta = buildPaginationMeta(finalCount, p, ps);
    meta.totalStock = totalStock;

    return {
      data: products,
      meta,
    };
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, created_by, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new AppError('Failed to fetch product', 500);
    if (!data) throw new NotFoundError('Product');

    return data;
  }

  async create(input, userId) {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...input, created_by: userId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError('Product with this SKU already exists', 409);
      throw new AppError('Failed to create product', 500);
    }

    if (input.current_stock && input.current_stock > 0) {
      const { error: mvError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: data.id,
          quantity_changed: input.current_stock,
          movement_type: 'IN',
          reason: 'Initial stock',
          created_by: userId,
        });
      if (mvError) throw new AppError('Failed to log initial stock movement', 500);
    }

    return data;
  }

  async update(id, input) {
    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === '23505') throw new AppError('Product with this SKU already exists', 409);
      throw new AppError('Failed to update product', 500);
    }
    if (!data) throw new NotFoundError('Product');

    return data;
  }

  async remove(id) {
    const { error, count } = await supabase
      .from('products')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) throw new AppError('Failed to delete product', 500);
    if (count === 0) throw new NotFoundError('Product');

    return { id };
  }

  async logMovement(productId, quantityChanged, movementType, reason, userId) {
    const product = await this.getById(productId);

    const newStock = movementType === 'IN'
      ? product.current_stock + quantityChanged
      : product.current_stock - quantityChanged;

    if (newStock < 0) {
      throw new AppError('Insufficient stock. Cannot reduce stock below zero.', 400, {
        current_stock: product.current_stock,
        requested: quantityChanged,
      });
    }

    const { data, error } = await supabase
      .from('stock_movements')
      .insert({
        product_id: productId,
        quantity_changed: quantityChanged,
        movement_type: movementType,
        reason,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new AppError('Failed to log stock movement', 500);

    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', productId);

    if (updateError) throw new AppError('Failed to update product stock', 500);

    return data;
  }

  async getMovements({ page = 1, pageSize = DEFAULT_PAGE_SIZE, productId = '', movementType = '' }) {
    const { page: p, pageSize: ps, from, to } = paginate(page, pageSize);

    let query = supabase
      .from('stock_movements')
      .select('id, product_id, quantity_changed, movement_type, reason, created_by, created_at, products(id, name, sku)', { count: 'exact' });

    if (productId) query = query.eq('product_id', productId);
    if (movementType) query = query.eq('movement_type', movementType);

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw new AppError('Failed to fetch stock movements', 500);

    return {
      data,
      meta: buildPaginationMeta(count || 0, p, ps),
    };
  }
}

export const productService = new ProductService();
