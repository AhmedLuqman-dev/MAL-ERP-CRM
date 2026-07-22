import { supabase } from '../config/supabase.js';
import { NotFoundError, UnauthorizedError, AppError } from '../utils/errors.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export class AuthService {
  async login(email, password) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password_hash, role')
      .eq('email', email)
      .maybeSingle();

    if (error) {
  console.error("Supabase Login Error:", error);
  throw new AppError(error.message, 500);
}
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new UnauthorizedError('Invalid email or password');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getUserById(id) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new AppError('Database error', 500);
    if (!user) throw new NotFoundError('User');

    return user;
  }
}

export const authService = new AuthService();
