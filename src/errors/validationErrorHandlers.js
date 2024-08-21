import HttpError from './httpErrorModel.js';
import { ErrorCodes, HttpStatusCodes } from './errorConstraints.js';

// Enhanced Joi Validation Error Handler
export const handleJoiValidationError = (err) => {
  const details = err.details.map((detail) => ({
    field: detail.context.key,
    value: detail.context.value,
    message: detail.message,
    type: detail.type,
  }));

  return new HttpError(
    'Validation Error',
    HttpStatusCodes.BAD_REQUEST,
    ErrorCodes.INVALID_INPUT,
    details
  );
};

// Enhanced Firebase Firestore Error Handler
export const handleFirestoreValidationError = (err) => {
  if (err.code === 'permission-denied') {
    return new HttpError(
      'Permission denied to access Firestore',
      HttpStatusCodes.FORBIDDEN,
      ErrorCodes.PERMISSION_DENIED
    );
  }
  // Add more cases as needed
  return new HttpError(
    err.message || 'Firestore Validation Error',
    HttpStatusCodes.BAD_REQUEST,
    ErrorCodes.INVALID_INPUT
  );
};
