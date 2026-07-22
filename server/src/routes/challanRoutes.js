import { Router } from 'express';
import {
  listChallans,
  getChallan,
  createChallan,
  updateChallanStatus,
} from '../controllers/challanController.js';
import {
  validateCreateChallan,
  validateUpdateChallanStatus,
} from '../validators/challanValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', listChallans);
router.get('/:id', getChallan);
router.post('/', authorize(ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTS), validateCreateChallan, validateRequest, createChallan);
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTS), validateUpdateChallanStatus, validateRequest, updateChallanStatus);

export default router;
