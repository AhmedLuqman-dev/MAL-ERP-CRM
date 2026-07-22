import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { customerService } from '../services/customerService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { ActionMenu } from '../components/ActionMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { CUSTOMER_TYPES, CUSTOMER_STATUSES } from '../constants';
import { formatDate } from '../utils/format';
import { Plus, Search, Eye, Pencil, Trash2, Users, Filter } from 'lucide-react';

export function CustomersPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.list({ page, search, status: statusFilter, customer_type: typeFilter });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customerService.remove(deleteId);
      setDeleteId(null);
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Customers"
        description="Manage your customer relationships"
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Customer
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
              placeholder="Search by name, mobile, email..."
              className="input pl-9"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input sm:w-40"
            >
              <option value="">All Statuses</option>
              {CUSTOMER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="input sm:w-40"
            >
              <option value="">All Types</option>
              {CUSTOMER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetch} />
        ) : !data?.data?.length ? (
          <EmptyState
            title="No customers found"
            message="Get started by adding your first customer."
            action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Customer</button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead className="bg-warm-50 border-b border-warm-200">
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Mobile</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Follow Up</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-200">
                  {data.data.map((customer) => (
                    <tr key={customer.id} className="hover:bg-warm-50 transition-colors">
                      <td className="table-cell">
                        <Link to={`/customers/${customer.id}`} className="font-medium text-charcoal-800 hover:text-emerald-600 transition-colors">
                          {customer.name}
                        </Link>
                        {customer.business_name && <p className="text-xs text-charcoal-400">{customer.business_name}</p>}
                      </td>
                      <td className="table-cell">{customer.mobile}</td>
                      <td className="table-cell"><StatusBadge status={customer.customer_type} /></td>
                      <td className="table-cell"><StatusBadge status={customer.status} /></td>
                      <td className="table-cell">{formatDate(customer.follow_up_date)}</td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/customers/${customer.id}`} className="p-1.5 rounded-lg hover:bg-warm-100 text-charcoal-500 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => { setEditing(customer); setShowForm(true); }}
                            className="p-1.5 rounded-lg hover:bg-warm-100 text-charcoal-500 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <ActionMenu items={[
                            { label: 'View', icon: Eye, onClick: () => window.location.href = `/customers/${customer.id}` },
                            { label: 'Edit', icon: Pencil, onClick: () => { setEditing(customer); setShowForm(true); } },
                            { label: 'Delete', icon: Trash2, danger: true, onClick: () => setDeleteId(customer.id) },
                          ]} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>

      <CustomerFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        editing={editing}
        onSuccess={() => { setShowForm(false); fetch(); }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </Layout>
  );
}
