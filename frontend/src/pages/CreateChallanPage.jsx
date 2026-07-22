import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { formatCurrency, formatNumber } from '../utils/format';
import { ArrowLeft, Plus, Trash2, FileText, AlertCircle, Search } from 'lucide-react';

export function CreateChallanPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { customer_id: '', items: [{ product_id: '', quantity: 1 }] },
  });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerService.list({ pageSize: 100 }),
          productService.list({ pageSize: 100 }),
        ]);
        setCustomers(custRes.data.data || []);
        setProducts(prodRes.data.data || []);
      } catch (err) {
        setServerError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const items = watch('items');

  const addItem = () => {
    const current = watch('items');
    setValue('items', [...current, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    const current = watch('items');
    if (current.length > 1) {
      setValue('items', current.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data) => {
    setServerError('');
    const validItems = data.items.filter((i) => i.product_id && i.quantity > 0);
    if (validItems.length === 0) {
      setServerError('At least one valid item is required');
      return;
    }
    try {
      const response = await challanService.create({
        customer_id: data.customer_id,
        items: validItems,
      });
      navigate('/challans');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create challan');
    }
  };

  const getSelectedProduct = (id) => products.find((p) => p.id === id);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="mb-4">
        <Link to="/challans" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Challans
        </Link>
      </div>

      <PageHeader title="Create Challan" description="Create a new delivery challan" />

      {serverError && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Customer *</label>
              <select {...register('customer_id', { required: 'Customer is required' })} className="input">
                <option value="">Select customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.mobile}</option>)}
              </select>
              {errors.customer_id && <p className="mt-1 text-xs text-red-500">{errors.customer_id.message}</p>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
            <h3 className="text-base font-semibold text-charcoal-800">Products</h3>
            <button type="button" onClick={addItem} className="btn-secondary text-sm">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          <div className="divide-y divide-warm-200">
            {items.map((item, index) => {
              const product = getSelectedProduct(item.product_id);
              return (
                <div key={index} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <label className="label">Product *</label>
                    <select {...register(`items.${index}.product_id`, { required: true })} className="input">
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — Stock: {p.current_stock}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="label">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                      className="input"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="label">Unit Price</label>
                    <p className="text-sm text-charcoal-700 py-2">
                      {product ? formatCurrency(product.unit_price) : '—'}
                    </p>
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="label">Available</label>
                    <p className={`text-sm py-2 ${product && item.quantity > product.current_stock ? 'text-red-600 font-medium' : 'text-charcoal-700'}`}>
                      {product ? formatNumber(product.current_stock) : '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 rounded-lg hover:bg-red-50 text-charcoal-400 hover:text-red-500 transition-colors sm:mt-6"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/challans" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Challan'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
