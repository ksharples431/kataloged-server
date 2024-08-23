import express from 'express';
import { logEntry } from '../config/cloudLoggingConfig.js';

const router = express.Router();

router.post('/log-frontend-error', async (req, res) => {
  const { message, stack, url, userAgent } = req.body;

  await logEntry({
    message: `Frontend Error: ${message}`,
    severity: 'ERROR',
    category: 'ClientError.FrontendError',
    stack,
    url,
    userAgent,
  });

  res.status(200).send('Error logged successfully');
});

export default router;
