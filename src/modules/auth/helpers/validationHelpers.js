import { createCustomError } from '../../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../../errors/errorConstraints.js';

export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw createCustomError(
      error.details[0].message,
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { details: error.details },
      { category: ErrorCategories.CLIENT_ERROR.VALIDATION }
    );
  }
};
