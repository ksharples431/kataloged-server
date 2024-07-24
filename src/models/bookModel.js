import Joi from 'joi';
import firebase from 'firebase-admin';

const FieldValue = firebase.firestore.FieldValue;

const customTimestamp = Joi.extend((joi) => ({
  type: 'timestamp',
  base: joi.any().valid(FieldValue.serverTimestamp()),
  messages: {
    'timestamp.base':
      '"{{#label}}" must be a valid date or FieldValue.serverTimestamp()',
  },
}));

export const createBookSchema = Joi.object({
  author: Joi.string().required(),
  bid: Joi.string().required(),
  createdAt: customTimestamp.timestamp().required(),
  description: Joi.string(),
  genre: Joi.string(),
  imagePath: Joi.string(),
  isbn: Joi.string(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  title: Joi.string().required(),
  updatedAt: customTimestamp.timestamp().required(),
  updatedAtString: Joi.date().iso().required(),
});

export const updateBookSchema = Joi.object({
  author: Joi.string(),
  bid: Joi.string().required(),
  description: Joi.string(),
  genre: Joi.string(),
  imagePath: Joi.string(),
  isbn: Joi.string(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  title: Joi.string(),
  updatedAt: customTimestamp.timestamp().required(),
  updatedAtString: Joi.date().iso().required(),
});
