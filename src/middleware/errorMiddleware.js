import {
  handleError,
  notFound,
  asyncErrorHandler,
} from '../errors/errorHandler.js';

// General error handling middleware
export const errorMiddleware = asyncErrorHandler(handleError);

// Not found route handler
export { notFound };
