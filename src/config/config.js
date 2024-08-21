import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envVarsSchema = Joi.object({
  GOOGLE_APPLICATION_CREDENTIALS: Joi.string().required(),
  CLOUDSDK_AUTH_ACCESS_TOKEN: Joi.string().required(), // Changed to string
  PORT: Joi.number().default(8080),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_URL_LOCAL: Joi.string().required(),
  APP_URL_PROD: Joi.string().required(),
  GOOGLE_BOOKS_API_KEY: Joi.string().required(),
  GOOGLE_BOOKS_API_URL: Joi.string().uri().required(),
  FB_API_KEY: Joi.string().required(),
  FB_AUTH_DOMAIN: Joi.string().required(),
  FB_PROJECT_ID: Joi.string().required(),
  FB_STORAGE_BUCKET: Joi.string().required(),
  FB_MESSAGING_SENDER_ID: Joi.string().required(),
  FB_APP_ID: Joi.string().required(),
  FB_MEASURMENT_ID: Joi.string().required(),
  OAUTH_CLIENT_ID: Joi.string().required(),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000), // 15 minutes
  AUTH_RATE_LIMIT_MAX_REQUESTS: Joi.number().default(5),
  AUTH_RATE_LIMIT_WINDOW_MS: Joi.number().default(60 * 60 * 1000), // 1 hour
}).unknown();

const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  google: {
    applicationCredentials: envVars.GOOGLE_APPLICATION_CREDENTIALS,
    authAccessToken: envVars.CLOUDSDK_AUTH_ACCESS_TOKEN,
    booksApiKey: envVars.GOOGLE_BOOKS_API_KEY,
    booksApiUrl: envVars.GOOGLE_BOOKS_API_URL,
  },
  server: {
    port: envVars.PORT,
    env: envVars.NODE_ENV,
  },
  app: {
    localUrl: envVars.APP_URL_LOCAL,
    prodUrl: envVars.APP_URL_PROD,
  },
  firebase: {
    apiKey: envVars.FB_API_KEY,
    authDomain: envVars.FB_AUTH_DOMAIN,
    projectId: envVars.FB_PROJECT_ID,
    storageBucket: envVars.FB_STORAGE_BUCKET,
    messagingSenderId: envVars.FB_MESSAGING_SENDER_ID,
    appId: envVars.FB_APP_ID,
    measurementId: envVars.FB_MEASURMENT_ID,
  },
  oauth: {
    clientId: envVars.OAUTH_CLIENT_ID,
  },
  rateLimit: {
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    auth: {
      max: envVars.AUTH_RATE_LIMIT_MAX_REQUESTS,
      windowMs: envVars.AUTH_RATE_LIMIT_WINDOW_MS,
    },
  },
};


export default config;
