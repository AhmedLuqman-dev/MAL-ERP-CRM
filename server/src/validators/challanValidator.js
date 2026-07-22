import { body } from 'express-validator';

export const validateCreateChallan = [
  body('customer_id').isUUID().withMessage('Valid customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').isUUID().withMessage('Valid product ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer for each item').toInt(),
];

export const validateUpdateChallanStatus = [
  body('status').isIn(['confirmed', 'cancelled']).withMessage('Status must be either confirmed or cancelled'),
];
