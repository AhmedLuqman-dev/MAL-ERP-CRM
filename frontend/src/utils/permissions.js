export const ROLE_PERMISSIONS = {
  admin: [
    '/',
    '/customers',
    '/customers/:id',
    '/products',
    '/inventory',
    '/challans',
    '/challans/new',
    '/challans/:id'
  ],
  sales: [
    '/',
    '/customers',
    '/customers/:id',
    '/challans',
    '/challans/new',
    '/challans/:id'
  ],
  warehouse: [
    '/',
    '/products',
    '/inventory'
  ],
  accounts: [
    '/',
    '/customers',
    '/customers/:id'
  ]
};

export const hasPermission = (role, path) => {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  
  const allowedPaths = ROLE_PERMISSIONS[role];
  
  // Exact match
  if (allowedPaths.includes(path)) return true;
  
  // Dynamic route match (e.g. /customers/123 matches /customers/:id)
  return allowedPaths.some(allowedPath => {
    if (allowedPath.includes(':')) {
      const regexPath = allowedPath.replace(/:\w+/g, '[^/]+');
      const regex = new RegExp(`^${regexPath}$`);
      return regex.test(path);
    }
    return false;
  });
};
