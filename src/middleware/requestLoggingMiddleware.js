import { logEntry } from '../config/cloudLoggingConfig.js';

export const requestLoggingMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logEntry({
      severity: 'INFO',
      message: `${req.method} ${req.originalUrl}`,
      statusCode: res.statusCode,
      duration,
      requestId: req.id,
    });
  });
  next();
};
