import Joi from 'joi';

export const createBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  genre: Joi.string(),
  description: Joi.string(),
  imagePath: Joi.string()
});

export const updateBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  genre: Joi.string(),
  description: Joi.string(),
  imagePath: Joi.string()
});
