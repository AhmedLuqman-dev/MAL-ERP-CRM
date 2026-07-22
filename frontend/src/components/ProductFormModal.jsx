import { useForm } from 'react-hook-form';
import { Modal } from './Modal';
import { productService } from '../services/productService';
import { PRODUCT_CATEGORIES } from '../constants';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export function ProductFormModal({ open, onClose, editing, onSuccess }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: editing || { unit_price: 0, current_stock: 0, minimum_stock: 0 },
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
      const payload = {
        ...data,
        unit_price: parseFloat(data.unit_price),
        current_stock: parseInt(data.current_stock, 10) || 0,
        minimum_stock: parseInt(data.minimum_stock, 10) || 0,
      };
      if (editing) {
        await productService.update(editing.id, payload);
      } else {
        await productService.create(payload);
      }
      reset();
      onSuccess();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save product');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
      {serverError && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Product Name *</label>
            <input {...register('name', { required: 'Name is required' })} className="input" placeholder="Widget Pro" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">SKU *</label>
            <input {...register('sku', { required: 'SKU is required' })} className="input font-mono" placeholder="WGT-001" />
            {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select {...register('category')} className="input">
              <option value="">Select category</option>
              {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Unit Price *</label>
            <input type="number" step="0.01" min="0" {...register('unit_price', { required: 'Price is required', min: 0 })} className="input" placeholder="0.00" />
            {errors.unit_price && <p className="mt-1 text-xs text-red-500">{errors.unit_price.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Current Stock</label>
            <input type="number" min="0" {...register('current_stock', { min: 0 })} className="input" placeholder="0" />
            {errors.current_stock && <p className="mt-1 text-xs text-red-500">{errors.current_stock.message}</p>}
          </div>
          <div>
            <label className="label">Minimum Stock Alert</label>
            <input type="number" min="0" {...register('minimum_stock', { min: 0 })} className="input" placeholder="0" />
            {errors.minimum_stock && <p className="mt-1 text-xs text-red-500">{errors.minimum_stock.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Warehouse Location</label>
          <input {...register('warehouse_location')} className="input" placeholder="A-1-2" />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (editing ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
