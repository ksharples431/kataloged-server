export default class HttpError extends Error {
  constructor(
    message,
    statusCode,
    errorCode = null,
    details = null,
    category = null
  ) {
    super(message);
    this.statusCode = statusCode || 500;
    this.name = this.constructor.name;
    this.isOperational = true;
    this.errorCode = errorCode;
    this.details = details;
    this.category = category;
    Error.captureStackTrace(this, this.constructor);
  }
}
