import { logEntry, loggingConfig } from '../config/cloudLoggingConfig.js';

export const requestLoggingMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!loggingConfig.errorOnly) {
      logEntry({
        severity: 'INFO',
        message: `${req.method} ${req.originalUrl}`,
        statusCode: res.statusCode,
        duration,
        requestId: req.id,
        category: 'ServerLog.RequestInfo',
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userId: req.user?.uid || 'unauthenticated',
        url: req.originalUrl,
        method: req.method,
        environment: process.env.NODE_ENV,
      }).catch(console.error);
    }
  });
  next();
};
