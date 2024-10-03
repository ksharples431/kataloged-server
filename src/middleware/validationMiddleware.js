import { validateInput } from '../utils/globalHelpers.js';
import { handleJoiValidationError } from '../errors/validationErrorHandlers.js';

export const validateRequest = (schema, type = 'query') => {
  return (req, res, next) => {
    console.log('Validating request:', req[type]); // Add this line for debugging
    try {
      const { error } = schema.validate(req[type], { abortEarly: false });
      if (error) {
        throw error;
      }
      next();
    } catch (error) {
      const validationError = handleJoiValidationError(error, req);
      res.status(validationError.statusCode).json(validationError);
    }
  };
};