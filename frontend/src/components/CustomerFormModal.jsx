import { useForm } from 'react-hook-form';
import { Modal } from './Modal';
import { customerService } from '../services/customerService';
import { CUSTOMER_TYPES, CUSTOMER_STATUSES } from '../constants';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export function CustomerFormModal({ open, onClose, editing, onSuccess }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: editing || { customer_type: 'retail', status: 'lead' },
  });
  const [serverError, setServerError] = useState('');

  const handleClose = () => {
    reset();
    setServerError('');
    onClose();
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      if (editing) {
        await customerService.update(editing.id, data);
      } else {
        await customerService.create(data);
      }
      reset();
      onSuccess();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save customer');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={editing ? 'Edit Customer' : 'Add Customer'} size="lg">
      {serverError && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Customer Name *</label>
            <input {...register('name', { required: 'Name is required' })} className="input" placeholder="John Doe" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Mobile Number *</label>
            <input {...register('mobile', { required: 'Mobile is required' })} className="input" placeholder="+1 234 567 890" />
            {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input type="email" {...register('email')} className="input" placeholder="john@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Business Name</label>
            <input {...register('business_name')} className="input" placeholder="Acme Inc" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">GST Number</label>
            <input {...register('gst_number')} className="input" placeholder="22AAAAA0000A1Z5" />
          </div>
          <div>
            <label className="label">Customer Type *</label>
            <select {...register('customer_type', { required: true })} className="input">
              {CUSTOMER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              {CUSTOMER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Follow Up Date</label>
            <input type="date" {...register('follow_up_date')} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <textarea {...register('address')} className="input" rows={2} placeholder="123 Main St, City, State" />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea {...register('notes')} className="input" rows={3} placeholder="Additional notes..." />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (editing ? 'Update Customer' : 'Add Customer')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
