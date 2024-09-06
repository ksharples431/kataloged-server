import Joi from 'joi';

export const getGenresQuerySchema = Joi.object({
  sortBy: Joi.string().valid('name', 'bookCount').default('name'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
}).unknown(false);

export const getGenreBooksQuerySchema = Joi.object({
  sortBy: Joi.string().valid('title', 'updatedAt').default('title'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
}).unknown(false);