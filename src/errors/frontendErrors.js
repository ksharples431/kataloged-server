import express from 'express';
import { logError } from './errorUtils.js';

const router = express.Router();

router.post('/log-frontend-error', async (req, res) => {
  const { message, stack, url, userAgent } = req.body;

  if (!message || !stack || !url || !userAgent) {
    return res.status(400).json({ message: 'Invalid error log data' });
  }

  try {
    await logError({
      message: `Frontend Error: ${message}`,
      severity: 'ERROR',
      category: 'ClientError.FrontendError',
      stack,
      url,
      userAgent,
    });

    res.status(200).json({ message: 'Error logged successfully' });
  } catch (error) {
    console.error('Error logging frontend error:', error);
    res.status(500).json({ message: 'Failed to log error' });
  }
});

export default router;
