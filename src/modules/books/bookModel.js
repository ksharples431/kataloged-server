import Joi from 'joi';

export const createBookSchema = Joi.object({
  author: Joi.string().required(),
  description: Joi.string(),
  genre: Joi.string(),
  imagePath: Joi.string().uri(),
  isbn: Joi.string(),
  lowercaseAuthor: Joi.string(),
  lowercaseTitle: Joi.string(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  title: Joi.string().required(),
  updatedAtString: Joi.date().iso(),

  bid: Joi.string().optional(),
  id: Joi.string().optional(),
}).unknown(false);

export const updateBookSchema = Joi.object({
  author: Joi.string(),
  description: Joi.string(),
  genre: Joi.string(),
  imagePath: Joi.string().uri(),
  isbn: Joi.string(),
  lowercaseAuthor: Joi.string(),
  lowercaseTitle: Joi.string(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  title: Joi.string(),
  updatedAtString: Joi.date().iso(),

  bid: Joi.string().forbidden(),
  id: Joi.string(),
}).unknown(false);

export const getBooksQuerySchema = Joi.object({
  sortBy: Joi.string()
    .valid('title', 'author', 'genre', 'updatedAt')
    .default('title'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
}).unknown(false);