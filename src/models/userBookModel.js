import Joi from 'joi';

export const addUserBookSchema = Joi.object({
  uid: Joi.string(),
  bid: Joi.string(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  format: Joi.string(),
  whereToGet: Joi.string(),
  progress: Joi.string(),
  favorite: Joi.boolean(),
  wishlist: Joi.boolean(),
  owned: Joi.boolean(),
  kataloged: Joi.boolean(),
});

export const updateUserBookSchema = Joi.object({
  uid: Joi.string().required(),
  bid: Joi.string().required(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  format: Joi.string(),
  whereToGet: Joi.string(),
  progress: Joi.string(),
  favorite: Joi.boolean(),
  wishlist: Joi.boolean(),
  owned: Joi.boolean(),
  kataloged: Joi.boolean(),
});
