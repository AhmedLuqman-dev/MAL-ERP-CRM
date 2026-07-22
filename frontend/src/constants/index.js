export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  CUSTOMERS: '/customers',
  CUSTOMER_DETAILS: '/customers/:id',
  PRODUCTS: '/products',
  INVENTORY: '/inventory',
  CHALLANS: '/challans',
  CREATE_CHALLAN: '/challans/new',
  NOT_FOUND: '*',
};

export const CUSTOMER_TYPES = [
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'distributor', label: 'Distributor' },
];

export const CUSTOMER_STATUSES = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const CHALLAN_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const MOVEMENT_TYPES = [
  { value: 'IN', label: 'Stock In' },
  { value: 'OUT', label: 'Stock Out' },
];

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Office Supplies',
  'Raw Materials',
  'Packaging',
  'Tools',
  'Other',
];

export const ROLES = {
  ADMIN: 'admin',
  SALES: 'sales',
  WAREHOUSE: 'warehouse',
  ACCOUNTS: 'accounts',
};

export const ROLE_LABELS = {
  admin: 'Admin',
  sales: 'Sales',
  warehouse: 'Warehouse',
  accounts: 'Accounts',
};

export const PAGE_SIZES = [10, 20, 50];

export const STORAGE_KEYS = {
  TOKEN: 'erp_token',
  USER: 'erp_user',
};
