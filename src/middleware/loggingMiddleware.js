import { logEntry } from '../config/cloudLoggingConfig.js';

export const withLogging = (routeHandler) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    try {
      await routeHandler(req, res, next);
      const duration = Date.now() - startTime;
      await logEntry({
        message: `${req.method} ${req.path} completed successfully`,
        severity: 'INFO',
        duration,
        method: req.method,
        path: req.path,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      await logEntry({
        message: `Error in ${req.method} ${req.path}`,
        severity: 'ERROR',
        error: error.message,
        duration,
        method: req.method,
        path: req.path,
      });
      next(error);
    }
  };
};
