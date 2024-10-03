import Joi from 'joi';

export const searchBookSchema = Joi.object({
  title: Joi.string().allow(''),
  author: Joi.string().allow(''),
  isbn: Joi.string().allow(''),
}).or('title', 'author', 'isbn');

export const generalSearchSchema = Joi.object({
  query: Joi.string().required(),
  uid: Joi.string(),
});
