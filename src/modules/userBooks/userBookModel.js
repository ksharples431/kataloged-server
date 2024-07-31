import Joi from 'joi';

const firestoreTimestampSchema = Joi.object({
  _seconds: Joi.number().integer().required(),
  _nanoseconds: Joi.number().integer().min(0).max(999999999).required(),
})


export const addUserBookSchema = Joi.object({
  bid: Joi.string().required(),
  createdAt: firestoreTimestampSchema,
  uid: Joi.string().required(),
  updatedAt: firestoreTimestampSchema,
  updatedAtString: Joi.date().iso(),
});

export const updateUserBookSchema = Joi.object({
  author: Joi.string(),
  bid: Joi.string(),
  createdAt: firestoreTimestampSchema,
  description: Joi.string(),
  favorite: Joi.boolean(),
  format: Joi.string(),
  genre: Joi.string(),
  imagePath: Joi.string(),
  isbn: Joi.string(),
  kataloged: Joi.boolean(),
  owned: Joi.boolean(),
  progress: Joi.string(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  title: Joi.string(),
  updatedAt: firestoreTimestampSchema,
  updatedAtString: Joi.date().iso(),
  uid: Joi.string(),
  whereToGet: Joi.string(),
  wishlist: Joi.boolean(),
});
