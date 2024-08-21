import { validateInput } from '../modules/books/bookHelpers.js';

export const validateRequest = (schema, type = 'body') => {
  return (req, res, next) => {
    try {
      validateInput(req[type], schema);
      next();
    } catch (error) {
      next(error);
    }
  };
};
