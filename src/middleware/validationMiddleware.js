import { validateInput } from '../utils/globalHelpers.js';
import { handleJoiValidationError } from '../errors/validationErrorHandlers.js';
import {
  HttpStatusCodes,
  ErrorCodes,
  ErrorCategories,
} from '../errors/errorMappings.js';

export const validateRequest = (schema, type = 'query') => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req[type], { abortEarly: false });
      if (error) {
        // If there's a validation error, transform it using the standardized error handling
        const validationError = handleJoiValidationError(error, req);
        res.status(validationError.statusCode).json(validationError);
      } else {
        next(); // If no validation error, proceed to the next middleware
      }
    } catch (error) {
      // Handle any unexpected errors during validation
      const validationError = handleJoiValidationError(error, req);
      res.status(validationError.statusCode).json(validationError);
    }
  };
};
