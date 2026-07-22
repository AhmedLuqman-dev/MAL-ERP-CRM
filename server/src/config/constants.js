export const ROLES = {
  ADMIN: 'admin',
  SALES: 'sales',
  WAREHOUSE: 'warehouse',
  ACCOUNTS: 'accounts',
};

export const ALL_ROLES = [ROLES.ADMIN, ROLES.SALES, ROLES.WAREHOUSE, ROLES.ACCOUNTS];

export const CUSTOMER_TYPES = ['retail', 'wholesale', 'distributor'];

export const CUSTOMER_STATUSES = ['lead', 'active', 'inactive'];

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Office Supplies',
  'Raw Materials',
  'Packaging',
  'Tools',
  'Other',
];

export const CHALLAN_STATUSES = ['draft', 'confirmed', 'cancelled'];

export const MOVEMENT_TYPES = ['IN', 'OUT'];

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
