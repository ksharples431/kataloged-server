import Joi from 'joi';

export const createBookSchema = Joi.object({
  bid: Joi.string().required(),
  title: Joi.string().required(),
  author: Joi.string().required(),
  genre: Joi.string(),
  description: Joi.string(),
  imagePath: Joi.string(),
  isbn: Joi.string()
});

export const updateBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  genre: Joi.string(),
  description: Joi.string(),
  imagePath: Joi.string()
});
