import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { challanService } from '../services/challanService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime, formatNumber, formatDate } from '../utils/format';
import { ArrowLeft, FileText, Calendar, Box, Download } from 'lucide-react';
import { exportChallanPDF } from '../utils/exportChallanPDF';

export function ChallanDetailsPage() {
  const { id } = useParams();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await challanService.getById(id);
      setChallan(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load challan details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleExportPDF = () => {
    if (challan) {
      exportChallanPDF(challan);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;
  if (error) return <Layout><ErrorState message={error} onRetry={fetch} /></Layout>;
  if (!challan) return <Layout><EmptyState title="Challan not found" message="The requested challan could not be found." /></Layout>;

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/challans" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Challans
        </Link>
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-charcoal-800 rounded-lg hover:bg-charcoal-900 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-charcoal-900">{challan.challan_number || 'Challan Details'}</h1>
                {challan.customers?.name && <p className="text-sm text-charcoal-500 mt-1">Customer: {challan.customers.name}</p>}
              </div>
              <div className="flex gap-2">
                <StatusBadge status={challan.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Calendar} label="Created At" value={formatDateTime(challan.created_at)} />
              <InfoRow icon={Box} label="Total Quantity" value={formatNumber(challan.total_quantity)} />
            </div>

            {challan.items && challan.items.length > 0 && (
              <div className="mt-8 pt-4 border-t border-warm-200">
                <h3 className="text-sm font-semibold text-charcoal-800 mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-warm-200">
                        <th className="text-left font-medium text-charcoal-500 pb-2">Product</th>
                        <th className="text-left font-medium text-charcoal-500 pb-2">SKU</th>
                        <th className="text-right font-medium text-charcoal-500 pb-2">Unit Price</th>
                        <th className="text-right font-medium text-charcoal-500 pb-2">Quantity</th>
                        <th className="text-right font-medium text-charcoal-500 pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-100">
                      {challan.items.map((item) => {
                        const name = item.products?.name || item.product_snapshot?.name || 'Unknown Product';
                        const sku = item.products?.sku || item.product_snapshot?.sku || '-';
                        const price = Number(item.unit_price) || Number(item.products?.unit_price) || Number(item.product_snapshot?.unit_price) || 0;
                        const lineTotal = price * item.quantity;

                        return (
                          <tr key={item.id}>
                            <td className="py-2 text-charcoal-800">{name}</td>
                            <td className="py-2 text-charcoal-600">{sku}</td>
                            <td className="py-2 text-right text-charcoal-600">${price.toFixed(2)}</td>
                            <td className="py-2 text-right font-medium text-charcoal-700">{formatNumber(item.quantity)}</td>
                            <td className="py-2 text-right font-medium text-charcoal-800">${lineTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-charcoal-800 mb-3">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Created</span>
                <span className="text-charcoal-700">{formatDateTime(challan.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-warm-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-charcoal-500" />
      </div>
      <div>
        <p className="text-xs text-charcoal-400">{label}</p>
        <p className="text-sm text-charcoal-700">{value}</p>
      </div>
    </div>
  );
}
