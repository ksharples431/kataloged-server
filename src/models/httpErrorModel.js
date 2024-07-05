export default class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.name = this.constructor.name;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends HttpError {
  constructor(message) {
    super(message, 400);
  }
}

export class NotFoundError extends HttpError {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}

export class DatabaseError extends HttpError {
  constructor(operation) {
    super(`Database error during ${operation}`, 500);
  }
}