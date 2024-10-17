import http from 'http';
import app from './index.js';
import { logEntry } from './config/cloudLoggingConfig.js';

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// Log uncaught exceptions and unhandled rejections
process.on('uncaughtException', async (error) => {
  console.error('Unhandled exception:', error);

  await logEntry({
    message: error.message,
    severity: 'CRITICAL',
    stack: error.stack,
  });

  server.close(() => {
    console.log('Server shutting down due to an unhandled exception.');
    process.exit(1);
  });
});

process.on('unhandledRejection', async (reason) => {
  console.error('Unhandled rejection:', reason);

  await logEntry({
    message: reason.message || reason,
    severity: 'CRITICAL',
    stack: reason.stack,
  });

  server.close(() => {
    console.log('Server shutting down due to an unhandled rejection.');
    process.exit(1);
  });
});
