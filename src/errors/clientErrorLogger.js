import express from 'express';
import { logError } from './errorLogger.js';

const router = express.Router();

router.post('/log-frontend-error', async (req, res) => {
  const {
    message,
    name,
    statusCode,
    errorCode,
    category,
    requestId,
    url,
    userAgent,
  } = req.body;

  if (!message || !name) {
    return res.status(400).json({ message: 'Invalid error log data' });
  }

  try {
    await logError(
      {
        message,
        name,
        statusCode: statusCode || 500,
        errorCode: errorCode || 'UNKNOWN_ERROR',
        category: category || 'UnknownError',
        requestId,
        url,
        userAgent,
      },
      { id: requestId, originalUrl: url, method: 'POST', ip: req.ip }
    );

    res.status(200).json({ message: 'Error logged successfully' });
  } catch (error) {
    console.error('Error logging frontend error:', error);
    res.status(500).json({ message: 'Failed to log error' });
  }
});

export default router;
