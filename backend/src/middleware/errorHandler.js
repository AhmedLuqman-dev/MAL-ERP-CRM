import { AppError } from '../utils/errors.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    console.error('Unexpected error:', error);
    error = new AppError('Internal server error', 500);
  }

  const response = {
    success: false,
    message: error.message,
  };

  if (error.details) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV === 'development' && !error.isOperational) {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
};

// eslint-disable-next-line no-unused-vars
export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
