import { body } from 'express-validator';
import { MOVEMENT_TYPES } from '../config/constants.js';

export const validateCreateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }).withMessage('Name must be less than 200 characters'),
  body('sku').trim().notEmpty().withMessage('SKU is required').isLength({ max: 50 }).withMessage('SKU must be less than 50 characters'),
  body('category').optional({ checkFalsy: true }).isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
  body('current_stock').optional().isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer').toInt(),
  body('minimum_stock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer').toInt(),
  body('warehouse_location').optional({ checkFalsy: true }).isLength({ max: 200 }).withMessage('Warehouse location must be less than 200 characters'),
];

export const validateUpdateProduct = [
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('sku').optional().trim().notEmpty().isLength({ max: 50 }),
  body('category').optional({ checkFalsy: true }).isLength({ max: 100 }),
  body('unit_price').optional().isFloat({ min: 0 }),
  body('current_stock').optional().isInt({ min: 0 }).toInt(),
  body('minimum_stock').optional().isInt({ min: 0 }).toInt(),
  body('warehouse_location').optional({ checkFalsy: true }).isLength({ max: 200 }),
];

export const validateStockMovement = [
  body('product_id').isUUID().withMessage('Valid product ID is required'),
  body('quantity_changed').isInt({ min: 1 }).withMessage('Quantity changed must be a positive integer').toInt(),
  body('movement_type').isIn(MOVEMENT_TYPES).withMessage(`Movement type must be one of: ${MOVEMENT_TYPES.join(', ')}`),
  body('reason').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
];
