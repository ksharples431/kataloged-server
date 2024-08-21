import http from 'http';
import app from './index.js'; // Import your Express app
import { logEntry } from './config/cloudLoggingConfig.js';

const PORT = process.env.PORT || 8080;

// Create the server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is listening for HTTP requests on port ${PORT}`);
});

// Global error handler
const handleGlobalError = async (error) => {
  console.error('Unhandled error:', error);
  // Log the error to Cloud Logging
  await logEntry({
    message: error.message,
    severity: 'ERROR',
    statusCode: 500,
    category: 'ServerError.InternalError',
    stack: error.stack || null,
  });

  // Gracefully shut down the server
  server.close(() => {
    console.log('Server closed due to an unhandled error.');
    process.exit(1);
  });
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  handleGlobalError(error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  handleGlobalError(reason);
});
