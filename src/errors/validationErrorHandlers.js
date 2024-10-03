import { createCustomError } from './customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from './errorMappings.js';

export const handleJoiValidationError = (err, req = {}) => {
  let details;

  if (err && Array.isArray(err.details)) {
    details = err.details.map((detail) => ({
      field: detail.context?.key,
      value: detail.context?.value,
      message: detail.message,
      type: detail.type,
    }));
  } else if (err && typeof err === 'object') {
    // If it's not a Joi error, but still an object, we'll create a generic detail
    details = [
      {
        message: err.message || 'Unknown validation error',
        type: 'unknown',
      },
    ];
  } else {
    // If it's not an object at all, we'll create a fallback detail
    details = [
      {
        message: 'Invalid input',
        type: 'unknown',
      },
    ];
  }

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
