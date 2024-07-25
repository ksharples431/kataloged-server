import Joi from 'joi';

const firestoreTimestampSchema = Joi.object({
  _seconds: Joi.number().integer().required(),
  _nanoseconds: Joi.number().integer().min(0).max(999999999).required(),
})

export const createBookSchema = Joi.object({
  author: Joi.string().required(),
  bid: Joi.string().required(),
  createdAt: firestoreTimestampSchema,
  description: Joi.string(),
  genre: Joi.string(),
  imagePath: Joi.string(),
  isbn: Joi.string(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  title: Joi.string().required(),
  updatedAt: firestoreTimestampSchema,
  updatedAtString: Joi.date().iso(),
});

export const updateBookSchema = Joi.object({
  author: Joi.string(),
  bid: Joi.string(),
  createdAt: firestoreTimestampSchema,
  description: Joi.string(),
  genre: Joi.string(),
  imagePath: Joi.string(),
  isbn: Joi.string(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  title: Joi.string(),
  updatedAt: firestoreTimestampSchema,
  updatedAt: firestoreTimestampSchema,
  updatedAtString: Joi.date().iso(),
});
