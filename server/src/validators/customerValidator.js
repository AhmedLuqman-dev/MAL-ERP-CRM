import { body } from 'express-validator';
import { CUSTOMER_TYPES, CUSTOMER_STATUSES } from '../config/constants.js';

export const validateCreateCustomer = [
  body('name').trim().notEmpty().withMessage('Customer name is required').isLength({ max: 200 }).withMessage('Name must be less than 200 characters'),
  body('mobile').trim().notEmpty().withMessage('Mobile number is required').matches(/^[+]?[\d\s-]{8,15}$/).withMessage('Invalid mobile number'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('business_name').optional({ checkFalsy: true }).isLength({ max: 200 }).withMessage('Business name must be less than 200 characters'),
  body('gst_number').optional({ checkFalsy: true }).isLength({ max: 20 }).withMessage('GST number must be less than 20 characters'),
  body('customer_type').isIn(CUSTOMER_TYPES).withMessage(`Customer type must be one of: ${CUSTOMER_TYPES.join(', ')}`),
  body('address').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Address must be less than 500 characters'),
  body('status').optional().isIn(CUSTOMER_STATUSES).withMessage(`Status must be one of: ${CUSTOMER_STATUSES.join(', ')}`),
  body('follow_up_date').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date format').toDate(),
  body('notes').optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage('Notes must be less than 2000 characters'),
];

export const validateUpdateCustomer = [
  body('name').optional().trim().notEmpty().withMessage('Customer name cannot be empty').isLength({ max: 200 }),
  body('mobile').optional().trim().notEmpty().matches(/^[+]?[\d\s-]{8,15}$/).withMessage('Invalid mobile number'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('business_name').optional({ checkFalsy: true }).isLength({ max: 200 }),
  body('gst_number').optional({ checkFalsy: true }).isLength({ max: 20 }),
  body('customer_type').optional().isIn(CUSTOMER_TYPES),
  body('address').optional({ checkFalsy: true }).isLength({ max: 500 }),
  body('status').optional().isIn(CUSTOMER_STATUSES),
  body('follow_up_date').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('notes').optional({ checkFalsy: true }).isLength({ max: 2000 }),
];

export const validateFollowUpNote = [
  body('note').trim().notEmpty().withMessage('Note is required').isLength({ max: 2000 }).withMessage('Note must be less than 2000 characters'),
  body('follow_up_date').isISO8601().withMessage('Valid follow up date is required').toDate(),
];
