import { supabase } from '../config/supabase.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';
import { DEFAULT_PAGE_SIZE } from '../config/constants.js';

export class CustomerService {
  async list({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '', status = '', customerType = '' }) {
    const { page: p, pageSize: ps, from, to } = paginate(page, pageSize);

    let query = supabase
      .from('customers')
      .select('id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by, created_at, updated_at', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,mobile.ilike.%${search}%,email.ilike.%${search}%,business_name.ilike.%${search}%`);
    }
    if (status) query = query.eq('status', status);
    if (customerType) query = query.eq('customer_type', customerType);

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw new AppError('Failed to fetch customers', 500);

    return {
      data,
      meta: buildPaginationMeta(count || 0, p, ps),
    };
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new AppError('Failed to fetch customer', 500);
    if (!data) throw new NotFoundError('Customer');

    return data;
  }

  async create(input, userId) {
    const { data, error } = await supabase
      .from('customers')
      .insert({ ...input, created_by: userId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError('Customer with this email already exists', 409);
      throw new AppError('Failed to create customer', 500);
    }

    return data;
  }

  async update(id, input) {
    const { data, error } = await supabase
      .from('customers')
      .update(input)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw new AppError('Failed to update customer', 500);
    if (!data) throw new NotFoundError('Customer');

    return data;
  }

  async remove(id) {
    const { error, count } = await supabase
      .from('customers')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) throw new AppError('Failed to delete customer', 500);
    if (count === 0) throw new NotFoundError('Customer');

    return { id };
  }

  async addFollowUpNote(customerId, note, followUpDate, userId) {
    await this.getById(customerId);

    const { data, error } = await supabase
      .from('follow_up_notes')
      .insert({
        customer_id: customerId,
        note,
        follow_up_date: followUpDate,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new AppError('Failed to add follow up note', 500);

    await supabase
      .from('customers')
      .update({ follow_up_date: followUpDate })
      .eq('id', customerId);

    return data;
  }

  async getFollowUpNotes(customerId) {
    await this.getById(customerId);

    const { data, error } = await supabase
      .from('follow_up_notes')
      .select('id, note, follow_up_date, created_by, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Failed to fetch follow up notes', 500);

    return data;
  }
}

export const customerService = new CustomerService();
