import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { customerService } from '../services/customerService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useForm } from 'react-hook-form';
import { formatDateTime, formatDate } from '../utils/format';
import { ArrowLeft, Mail, Phone, Building, MapPin, FileText, Plus, Calendar } from 'lucide-react';

export function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [custRes, notesRes] = await Promise.all([
        customerService.getById(id),
        customerService.getFollowUpNotes(id),
      ]);
      setCustomer(custRes.data?.data || custRes.data);
      setNotes(notesRes.data?.data || notesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <Layout><LoadingSpinner /></Layout>;
  if (error) return <Layout><ErrorState message={error} onRetry={fetch} /></Layout>;
  if (!customer) return <Layout><EmptyState title="Customer not found" message="The requested customer could not be found." /></Layout>;

  return (
    <Layout>
      <div className="mb-4">
        <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-charcoal-900">{customer.name}</h1>
                {customer.business_name && <p className="text-sm text-charcoal-500 mt-1">{customer.business_name}</p>}
              </div>
              <div className="flex gap-2">
                <StatusBadge status={customer.customer_type} />
                <StatusBadge status={customer.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Phone} label="Mobile" value={customer.mobile} />
              <InfoRow icon={Mail} label="Email" value={customer.email || '—'} />
              <InfoRow icon={Building} label="GST Number" value={customer.gst_number || '—'} />
              <InfoRow icon={Calendar} label="Follow Up Date" value={formatDate(customer.follow_up_date)} />
              <InfoRow icon={MapPin} label="Address" value={customer.address || '—'} />
            </div>

            {customer.notes && (
              <div className="mt-4 pt-4 border-t border-warm-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-2">Notes</p>
                <p className="text-sm text-charcoal-600">{customer.notes}</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
              <h3 className="text-base font-semibold text-charcoal-800">Follow Up Notes</h3>
              <button onClick={() => setShowNoteForm(true)} className="btn-secondary text-sm">
                <Plus className="w-4 h-4" /> Add Note
              </button>
            </div>
            <div className="divide-y divide-warm-200">
              {notes.length === 0 ? (
                <p className="px-5 py-8 text-sm text-charcoal-400 text-center">No follow up notes yet</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-charcoal-800">{formatDate(note.follow_up_date)}</span>
                      <span className="text-xs text-charcoal-400">{formatDateTime(note.created_at)}</span>
                    </div>
                    <p className="text-sm text-charcoal-600">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-charcoal-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/challans/new" className="btn-secondary w-full justify-start">
                <FileText className="w-4 h-4" /> Create Challan
              </Link>
              <button onClick={() => setShowNoteForm(true)} className="btn-secondary w-full justify-start">
                <Plus className="w-4 h-4" /> Add Follow Up
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-charcoal-800 mb-3">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Created</span>
                <span className="text-charcoal-700">{formatDateTime(customer.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Updated</span>
                <span className="text-charcoal-700">{formatDateTime(customer.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FollowUpNoteModal
        open={showNoteForm}
        onClose={() => setShowNoteForm(false)}
        customerId={id}
        onSuccess={() => { setShowNoteForm(false); fetch(); }}
      />
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

function FollowUpNoteModal({ open, onClose, customerId, onSuccess }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await customerService.addFollowUpNote(customerId, data);
      reset();
      onSuccess();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to add note');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Follow Up Note" size="md">
      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Follow Up Date *</label>
          <input type="date" {...register('follow_up_date', { required: 'Date is required' })} className="input" />
          {errors.follow_up_date && <p className="mt-1 text-xs text-red-500">{errors.follow_up_date.message}</p>}
        </div>
        <div>
          <label className="label">Note *</label>
          <textarea {...register('note', { required: 'Note is required' })} className="input" rows={4} placeholder="Enter follow up note..." />
          {errors.note && <p className="mt-1 text-xs text-red-500">{errors.note.message}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
