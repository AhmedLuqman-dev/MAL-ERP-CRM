import { Router } from 'express';
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addFollowUpNote,
  getFollowUpNotes,
} from '../controllers/customerController.js';
import {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateFollowUpNote,
} from '../validators/customerValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.post('/', authorize(ROLES.ADMIN, ROLES.SALES), validateCreateCustomer, validateRequest, createCustomer);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.SALES), validateUpdateCustomer, validateRequest, updateCustomer);
router.delete('/:id', authorize(ROLES.ADMIN), deleteCustomer);

router.get('/:id/follow-up-notes', getFollowUpNotes);
router.post('/:id/follow-up-notes', authorize(ROLES.ADMIN, ROLES.SALES), validateFollowUpNote, validateRequest, addFollowUpNote);

export default router;
