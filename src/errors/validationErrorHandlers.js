import { createCustomError } from './customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from './errorConstraints.js';

export const handleJoiValidationError = (err, req = {}) => {
  const details = err.details.map((detail) => ({
    field: detail.context.key,
    value: detail.context.value,
    message: detail.message,
    type: detail.type,
  }));

  return createCustomError(
    'Validation Error',
    HttpStatusCodes.BAD_REQUEST,
    ErrorCodes.INVALID_INPUT,
    { details, requestId: req.id },
    {
      stack: err.stack,
      category: ErrorCategories.CLIENT_ERROR.VALIDATION,
    }
  );
};

