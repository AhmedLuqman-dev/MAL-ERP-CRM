import { authService } from '../services/authService.js';
import { asyncHandler } from '../utils/helpers.js';
import { formatResponse } from '../utils/helpers.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(formatResponse(result));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  res.status(200).json(formatResponse(user));
});
