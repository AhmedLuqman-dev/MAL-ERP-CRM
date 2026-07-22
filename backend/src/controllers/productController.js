import { productService } from '../services/productService.js';
import { asyncHandler, formatResponse } from '../utils/helpers.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { page, pageSize, search, category, lowStock } = req.query;
  const result = await productService.list({
    page,
    pageSize,
    search,
    category,
    lowStock: lowStock === 'true',
  });
  res.status(200).json(formatResponse(result.data, result.meta));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  res.status(200).json(formatResponse(product));
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body, req.user.id);
  res.status(201).json(formatResponse(product));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  res.status(200).json(formatResponse(product));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.remove(req.params.id);
  res.status(200).json(formatResponse({ id: req.params.id }));
});

export const getStockMovements = asyncHandler(async (req, res) => {
  const { page, pageSize, product_id, movement_type } = req.query;
  const result = await productService.getMovements({
    page,
    pageSize,
    productId: product_id,
    movementType: movement_type,
  });
  res.status(200).json(formatResponse(result.data, result.meta));
});

export const addStockMovement = asyncHandler(async (req, res) => {
  const { product_id, quantity_changed, movement_type, reason } = req.body;
  const result = await productService.logMovement(product_id, quantity_changed, movement_type, reason, req.user.id);
  res.status(201).json(formatResponse(result));
});
