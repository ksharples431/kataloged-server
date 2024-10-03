import http from 'http';
import app from './index.js';
import { logEntry } from './config/cloudLoggingConfig.js';
import {
  ErrorCategories,
  HttpStatusCodes,
  ErrorCodes,
} from './errors/errorMappings.js';
import { wrapError } from './errors/errorUtils.js';

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is listening for HTTP requests on port ${PORT}`);
});

const handleGlobalError = async (error) => {
  console.error('Unhandled error:', error);

  const wrappedError = wrapError(error, {
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCodes.UNEXPECTED_ERROR,
    category: ErrorCategories.SERVER_ERROR.INTERNAL,
  });

  await logEntry({
    message: wrappedError.message,
    severity: 'CRITICAL',
    statusCode: wrappedError.statusCode,
    category: wrappedError.category,
    errorCode: wrappedError.errorCode,
    stack: wrappedError.stack,
  });

  server.close(() => {
    console.log('Server closed due to an unhandled error.');
    process.exit(1);
  });
};

process.on('uncaughtException', handleGlobalError);
process.on('unhandledRejection', (reason) => handleGlobalError(reason));
