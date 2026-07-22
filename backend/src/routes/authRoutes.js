import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import { validateLogin } from '../validators/authValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', validateLogin, validateRequest, login);
router.get('/me', authenticate, getMe);

export default router;
