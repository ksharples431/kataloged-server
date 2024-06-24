export default class HttpError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.code = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
