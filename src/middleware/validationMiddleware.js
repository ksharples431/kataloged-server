import { HttpStatusCodes } from '../errors/errorCategories.js';

/**
 * Middleware to validate incoming requests using a Joi schema.
 * If validation fails, the error is passed to the global error handler.
 *
 * @param {Object} schema - Joi validation schema.
 * @param {string} type - Type of the request to validate (e.g., 'body', 'query').
 */
export const validateRequest = (schema, type = 'query') => {
  return (req, res, next) => {
    console.log('Validating request:', req[type]); // Debugging line

    // Perform validation
    const { error } = schema.validate(req[type], { abortEarly: false });

    // If there's a validation error, construct an error object and pass to the global handler
    if (error) {
      const validationError = {
        message: 'Validation Error',
        statusCode: HttpStatusCodes.BAD_REQUEST,
        errorCode: 'INVALID_INPUT',
        details: error.details, // Joi provides an array of validation error details
        requestId: req.id,
      };

      return next(validationError); // Pass the error to the global error handler
    }

    // If validation passes, move to the next middleware
    next();
  };
};
