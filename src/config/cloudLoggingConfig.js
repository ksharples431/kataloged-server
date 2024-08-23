import { Logging } from '@google-cloud/logging';
import config from './config.js';

let log;
let metadata;

if (config.server.env === 'production') {
  try {
    const logging = new Logging({
      projectId: process.env.FB_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    log = logging.log('kataloged-log');
    metadata = {
      resource: { type: 'global' },
    };
    console.log('Connected to Cloud Logging');
  } catch (error) {
    console.error('Failed to initialize Cloud Logging:', error);
  }
}

const fallbackLog = {
  entry: (metadata, data) => ({ metadata, ...data }),
  write: (entry) => {
    if (entry.severity && entry.severity !== 'INFO') {
      console.log('Log Entry:', JSON.stringify(entry, null, 2));
    }
    return Promise.resolve();
  },
};

export const logEntry = async (entry) => {
  if (config.server.env === 'production' && log) {
    try {
      await log.write(log.entry(metadata, entry));
    } catch (error) {
      console.error('Error writing to Cloud Logging:', error);
      if (entry.severity !== 'INFO') {
        console.log('Fallback Log Entry:', JSON.stringify(entry, null, 2));
      }
    }
  } else if (entry.severity !== 'INFO') {
    await fallbackLog.write(fallbackLog.entry(metadata, entry));
  }
};

export { metadata };
