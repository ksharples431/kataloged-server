import { validateInput } from '../utils/globalHelpers.js';
import { handleJoiValidationError } from '../errors/validationErrorHandlers.js';

export const validateRequest = (schema, type = 'body') => {
  return (req, res, next) => {
    try {
      validateInput(req[type], schema);
      next();
    } catch (error) {
      next(handleJoiValidationError(error, req));
    }
  };
};
