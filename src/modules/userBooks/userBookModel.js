import Joi from 'joi';
//todo: double check data going both directions
//todo: transform incoming data so i dont have to accept id
export const addUserBookSchema = Joi.object({
  bid: Joi.string().required(),
  uid: Joi.string().required(),
  kataloged: Joi.boolean(),
  updatedAtString: Joi.date().iso(),

  id: Joi.string().optional(),
});

export const updateUserBookSchema = Joi.object({
  author: Joi.string(),
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
  updatedAtString: Joi.date().iso(),
  whereToGet: Joi.string(),
  wishlist: Joi.boolean(),

  bid: Joi.string().forbidden(),
  uid: Joi.string().forbidden(),
  id: Joi.string(),
});
