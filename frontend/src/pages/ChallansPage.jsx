import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { challanService } from '../services/challanService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CHALLAN_STATUSES } from '../constants';
import { formatDateTime, formatNumber } from '../utils/format';
import { Plus, Search, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';

export function ChallansPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await challanService.list({ page, search, status: statusFilter });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load challans');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleStatusChange = async () => {
    setActionLoading(true);
    try {
      await challanService.updateStatus(confirmAction.id, confirmAction.status);
      setConfirmAction(null);
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update challan status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Sales Challans"
        description="Manage delivery challans and their status"
        actions={
          <Link to="/challans/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Create Challan
          </Link>
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
              placeholder="Search by challan number..."
              className="input pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input sm:w-44"
          >
            <option value="">All Statuses</option>
            {CHALLAN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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
            title="No challans found"
            message="Create your first sales challan to get started."
            action={<Link to="/challans/new" className="btn-primary"><Plus className="w-4 h-4" /> Create Challan</Link>}
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead className="bg-warm-50 border-b border-warm-200">
                  <tr>
                    <th className="table-header">Challan No.</th>
                    <th className="table-header">Customer</th>
                    <th className="table-header">Total Qty</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Created</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-200">
                  {data.data.map((challan) => (
                    <tr key={challan.id} className="hover:bg-warm-50 transition-colors">
                      <td className="table-cell">
                        <Link to={`/challans/${challan.id}`} className="font-medium text-charcoal-800 hover:text-emerald-600 transition-colors">
                          {challan.challan_number}
                        </Link>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="text-sm text-charcoal-700">{challan.customers?.name || '—'}</p>
                          <p className="text-xs text-charcoal-400">{challan.customers?.mobile || ''}</p>
                        </div>
                      </td>
                      <td className="table-cell">{formatNumber(challan.total_quantity)}</td>
                      <td className="table-cell"><StatusBadge status={challan.status} /></td>
                      <td className="table-cell text-charcoal-500">{formatDateTime(challan.created_at)}</td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          {challan.status === 'draft' && (
                            <>
                              <button
                                onClick={() => setConfirmAction({ id: challan.id, status: 'confirmed', label: 'confirm', message: 'Confirming this challan will reduce stock for all items. This action cannot be undone.' })}
                                className="btn-emerald text-xs px-2.5 py-1.5"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Confirm
                              </button>
                              <button
                                onClick={() => setConfirmAction({ id: challan.id, status: 'cancelled', label: 'cancel', message: 'Are you sure you want to cancel this challan?' })}
                                className="btn-ghost text-xs px-2.5 py-1.5 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancel
                              </button>
                            </>
                          )}
                          <Link to={`/challans/${challan.id}`} className="p-1.5 rounded-lg hover:bg-warm-100 text-charcoal-500 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
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

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleStatusChange}
        title={confirmAction?.status === 'confirmed' ? 'Confirm Challan' : 'Cancel Challan'}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.status === 'confirmed' ? 'Confirm' : 'Cancel Challan'}
        loading={actionLoading}
      />
    </Layout>
  );
}
