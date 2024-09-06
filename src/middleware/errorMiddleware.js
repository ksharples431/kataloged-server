import { handleAsyncErrorMiddleware } from '../errors/errorUtils.js';
import { globalErrorHandler } from '../errors/errorHandler.js';
import { notFound } from '../errors/errorUtils.js';

// General error handling middleware
export const errorMiddleware =
  handleAsyncErrorMiddleware(globalErrorHandler);

// Not found route handler
export { notFound };
