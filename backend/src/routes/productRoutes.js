import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getStockMovements,
  addStockMovement,
} from '../controllers/productController.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateStockMovement,
} from '../validators/productValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', authorize(ROLES.ADMIN, ROLES.WAREHOUSE), validateCreateProduct, validateRequest, createProduct);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.WAREHOUSE), validateUpdateProduct, validateRequest, updateProduct);
router.delete('/:id', authorize(ROLES.ADMIN), deleteProduct);

router.get('/inventory/movements', getStockMovements);
router.post('/inventory/movements', authorize(ROLES.ADMIN, ROLES.WAREHOUSE), validateStockMovement, validateRequest, addStockMovement);

export default router;
