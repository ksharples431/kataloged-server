import Joi from 'joi';

export const searchBookSchema = Joi.object({
  title: Joi.string(),
  author: Joi.string(),
  isbn: Joi.string(),
}).or('title', 'author', 'isbn');

export const generalSearchSchema = Joi.object({
  query: Joi.string().required(),
  uid: Joi.string(),
});
