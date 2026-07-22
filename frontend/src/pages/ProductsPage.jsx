import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { productService } from '../services/productService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { ActionMenu } from '../components/ActionMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ProductFormModal } from '../components/ProductFormModal';
import { PRODUCT_CATEGORIES } from '../constants';
import { formatCurrency, formatNumber } from '../utils/format';
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';

export function ProductsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.list({ page, search, category: categoryFilter, lowStock });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, lowStock]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.remove(deleteId);
      setDeleteId(null);
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Product
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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or SKU..."
              className="input pl-9"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="input sm:w-44"
          >
            <option value="">All Categories</option>
            {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal-600 bg-warm-100 rounded-lg cursor-pointer hover:bg-warm-200 transition-colors">
            <input type="checkbox" checked={lowStock} onChange={(e) => { setLowStock(e.target.checked); setPage(1); }} className="rounded" />
            Low Stock
          </label>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetch} />
        ) : !data?.data?.length ? (
          <EmptyState
            title="No products found"
            message="Add your first product to get started."
            action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Product</button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead className="bg-warm-50 border-b border-warm-200">
                  <tr>
                    <th className="table-header">Product Name</th>
                    <th className="table-header">SKU</th>
                    <th className="table-header">Category</th>
                    <th className="table-header">Unit Price</th>
                    <th className="table-header">Stock</th>
                    <th className="table-header">Location</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-200">
                  {data.data.map((product) => {
                    const isLow = product.current_stock <= product.minimum_stock;
                    return (
                      <tr key={product.id} className="hover:bg-warm-50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-warm-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-charcoal-500" />
                            </div>
                            <span className="font-medium text-charcoal-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="table-cell font-mono text-xs">{product.sku}</td>
                        <td className="table-cell">{product.category || '—'}</td>
                        <td className="table-cell">{formatCurrency(product.unit_price)}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className={isLow ? 'text-amber-600 font-medium' : 'text-charcoal-700'}>
                              {formatNumber(product.current_stock)}
                            </span>
                            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                          <p className="text-xs text-charcoal-400">Min: {product.minimum_stock}</p>
                        </td>
                        <td className="table-cell">{product.warehouse_location || '—'}</td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditing(product); setShowForm(true); }}
                              className="p-1.5 rounded-lg hover:bg-warm-100 text-charcoal-500 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <ActionMenu items={[
                              { label: 'Edit', icon: Pencil, onClick: () => { setEditing(product); setShowForm(true); } },
                              { label: 'Delete', icon: Trash2, danger: true, onClick: () => setDeleteId(product.id) },
                            ]} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>

      <ProductFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        editing={editing}
        onSuccess={() => { setShowForm(false); fetch(); }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </Layout>
  );
}
