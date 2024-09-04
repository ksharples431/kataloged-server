import { Logging } from '@google-cloud/logging';

let log;
let metadata;

// Configuration object for logging levels
const loggingConfig = {
  errorOnly: true, // Set to false to enable more detailed logging
  logLevels: ['ERROR', 'CRITICAL', 'WARNING', 'NOTICE'],
};

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

const fallbackLog = {
  entry: (metadata, data) => ({ metadata, ...data }),
  write: (entry) => {
    console.log('Fallback Log Entry:', JSON.stringify(entry, null, 2));
    return Promise.resolve();
  },
};

export const logEntry = async (entry) => {
  if (
    loggingConfig.errorOnly &&
    !loggingConfig.logLevels.includes(entry.severity)
  ) {
    return; // Skip non-error logs when in error-only mode
  }

  try {
    if (log) {
      await log.write(log.entry(metadata, entry));
      console.log(
        `Log entry successfully written to cloud: ${entry.message}`
      );
    } else {
      await fallbackLog.write(fallbackLog.entry(metadata, entry));
      console.log(`Log entry written to fallback: ${entry.message}`);
    }
  } catch (error) {
    console.error(`Failed to log entry: ${entry.message}`, error);
  }
};

export const setLoggingMode = (errorOnly) => {
  loggingConfig.errorOnly = errorOnly;
};

export { metadata, loggingConfig };
