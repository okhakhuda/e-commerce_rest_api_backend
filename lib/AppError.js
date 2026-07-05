import { HttpCode } from './constants.js';

class AppError extends Error {
  constructor(message, statusCode = HttpCode.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request') {
    return new AppError(message, HttpCode.BAD_REQUEST);
  }

  static unauthorized(message = 'Not authorized') {
    return new AppError(message, HttpCode.UNAUTHORIZED);
  }

  static forbidden(message = 'Access denied') {
    return new AppError(message, HttpCode.FORBIDDEN);
  }

  static notFound(message = 'Not found') {
    return new AppError(message, HttpCode.NOT_FOUND);
  }

  static conflict(message = 'Conflict') {
    return new AppError(message, HttpCode.CONFLICT);
  }
}

export default AppError;
