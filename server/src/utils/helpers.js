export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const paginate = (page = 1, pageSize = 10) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
  const from = (p - 1) * ps;
  const to = from + ps - 1;
  return { page: p, pageSize: ps, from, to };
};

export const buildPaginationMeta = (total, page, pageSize) => ({
  total,
  page,
  pageSize,
  totalPages: Math.ceil(total / pageSize) || 0,
});

export const formatResponse = (data = null, meta = null) => {
  const response = { success: true };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return response;
};
