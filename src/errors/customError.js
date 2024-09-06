import {
  HttpStatusCodes,
  ErrorCodes,
  ErrorCategories,
} from './errorConstraints.js';

function filterStack(stack) {
  return stack
    .split('\n')
    .filter((line) => {
      return (
        !line.includes('node_modules') && !line.includes('(internal)')
      );
    })
    .join('\n');
}

export class CustomError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode =
      options.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
    this.errorCode = options.errorCode || ErrorCodes.UNEXPECTED_ERROR;
    this.category =
      options.category || ErrorCategories.SERVER_ERROR.UNKNOWN;
    this.details = options.details || null;
    this.requestId = options.requestId || null;
    this.originalError = options.originalError || null;

    if (options.stack) {
      this.stack = filterStack(options.stack);
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
      this.stack = filterStack(this.stack);
    }
  }
}

export const createCustomError = (
  message,
  statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR,
  errorCode = ErrorCodes.UNEXPECTED_ERROR,
  details = null,
  options = {}
) => {
  const category =
    options.category || ErrorCategories.SERVER_ERROR.UNKNOWN;
  let stack =
    options.stack ||
    (options.originalError && options.originalError.stack);

  if (stack) {
    stack = filterStack(stack);
  }

  return new CustomError(message, {
    statusCode,
    errorCode,
    category,
    details,
    stack,
    requestId: options.requestId,
    originalError: options.originalError,
  });
};

export const createUnknownError = (error, req = {}) => {
  const errorMessage = error?.message || 'An unknown error occurred';
  return createCustomError(
    errorMessage,
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
    ErrorCodes.UNKNOWN_ERROR,
    { originalError: error, requestId: req.id },
    { stack: error?.stack, category: ErrorCategories.SERVER_ERROR.UNKNOWN }
  );
};
