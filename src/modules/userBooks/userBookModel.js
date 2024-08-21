import Joi from 'joi';

export const addUserBookSchema = Joi.object({
  bid: Joi.string().required(),
  uid: Joi.string().required(),
  kataloged: Joi.boolean().default(false),
  updatedAtString: Joi.date().iso(),

  id: Joi.string().optional(),
}).unknown(false);

export const updateUserBookSchema = Joi.object({
  author: Joi.string(),
  description: Joi.string(),
  favorite: Joi.boolean(),
  format: Joi.string(),
  genre: Joi.string(),
  imagePath: Joi.string().uri(),
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
}).unknown(false);

export const getUserBooksQuerySchema = Joi.object({
  uid: Joi.string().required(),
  sortBy: Joi.string()
    .valid('title', 'author', 'updatedAt')
    .default('title'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
  full: Joi.boolean().default(false),
});
