import { Logging } from '@google-cloud/logging';
import config from './config.js';

let log;
let metadata;

if (config.server.env === 'development') {
  try {
    const logging = new Logging({
      projectId: process.env.FB_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    log = logging.log('kataloged-log');
    metadata = {
      resource: { type: 'global' },
    };
  } catch (error) {
    console.error('Failed to initialize Cloud Logging:', error);
  }
}

const fallbackLog = {
  entry: (metadata, data) => ({ metadata, ...data }),
  write: (entry) => {
    console.log('Log Entry:', JSON.stringify(entry, null, 2));
    return Promise.resolve();
  },
};

export const logEntry = async (entry) => {
  if (config.server.env === 'production' && log) {
    try {
      await log.write(log.entry(metadata, entry));
    } catch (error) {
      console.error('Error writing to Cloud Logging:', error);
      console.log('Fallback Log Entry:', JSON.stringify(entry, null, 2));
    }
  } else {
    await fallbackLog.write(fallbackLog.entry(metadata, entry));
  }
};

export { metadata };
