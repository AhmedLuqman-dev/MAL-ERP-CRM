import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { productService } from '../services/productService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { useForm } from 'react-hook-form';
import { MOVEMENT_TYPES } from '../constants';
import { formatDateTime, formatNumber } from '../utils/format';
import { Plus, Search, TrendingUp, TrendingDown, Boxes } from 'lucide-react';

export function InventoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getMovements({ page, movement_type: typeFilter });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <Layout>
      <PageHeader
        title="Inventory"
        description="Track stock movements and inventory changes"
        actions={
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Log Movement
          </button>
        }
      />

      <div className="card mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movements..."
              className="input pl-9"
              disabled
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="input sm:w-44"
          >
            <option value="">All Movements</option>
            {MOVEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetch} />
        ) : !data?.data?.length ? (
          <EmptyState
            title="No stock movements"
            message="Log a stock movement to get started."
            action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Log Movement</button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead className="bg-warm-50 border-b border-warm-200">
                  <tr>
                    <th className="table-header">Product</th>
                    <th className="table-header">SKU</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Quantity</th>
                    <th className="table-header">Reason</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-200">
                  {data.data.map((movement) => (
                    <tr key={movement.id} className="hover:bg-warm-50 transition-colors">
                      <td className="table-cell font-medium text-charcoal-800">
                        {movement.products?.name || '—'}
                      </td>
                      <td className="table-cell font-mono text-xs">{movement.products?.sku || '—'}</td>
                      <td className="table-cell">
                        <span className={`badge ${movement.movement_type === 'IN' ? 'badge-active' : 'badge-inactive'}`}>
                          {movement.movement_type === 'IN' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {movement.movement_type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={movement.movement_type === 'IN' ? 'text-emerald-600 font-medium' : 'text-charcoal-700'}>
                          {movement.movement_type === 'IN' ? '+' : '-'}{formatNumber(movement.quantity_changed)}
                        </span>
                      </td>
                      <td className="table-cell text-charcoal-500">{movement.reason || '—'}</td>
                      <td className="table-cell text-charcoal-500">{formatDateTime(movement.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>

      <StockMovementModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => { setShowForm(false); fetch(); }}
      />
    </Layout>
  );
}

function StockMovementModal({ open, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: { movement_type: 'IN', quantity_changed: 1 },
  });
  const [serverError, setServerError] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingProducts(true);
      productService.list({ pageSize: 100 }).then((res) => {
        setProducts(res.data.data || []);
      }).finally(() => setLoadingProducts(false));
    }
  }, [open]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await productService.addMovement({
        ...data,
        quantity_changed: parseInt(data.quantity_changed, 10),
      });
      reset();
      onSuccess();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to log movement');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Log Stock Movement" size="md">
      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Product *</label>
          <select {...register('product_id', { required: 'Product is required' })} className="input">
            <option value="">Select product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku}) — Stock: {p.current_stock}</option>)}
          </select>
          {errors.product_id && <p className="mt-1 text-xs text-red-500">{errors.product_id.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Movement Type *</label>
            <select {...register('movement_type', { required: true })} className="input">
              {MOVEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quantity *</label>
            <input type="number" min="1" {...register('quantity_changed', { required: 'Quantity is required', min: 1 })} className="input" />
            {errors.quantity_changed && <p className="mt-1 text-xs text-red-500">{errors.quantity_changed.message}</p>}
          </div>
        </div>
        <div>
          <label className="label">Reason</label>
          <input {...register('reason')} className="input" placeholder="e.g. New stock arrival, Damaged goods" />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Logging...' : 'Log Movement'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
