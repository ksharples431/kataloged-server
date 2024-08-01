import Joi from 'joi';
//todo: double check data going both directions
//todo: transform incoming data so i dont have to accept id
export const createBookSchema = Joi.object({
  author: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string(),
  genre: Joi.string(),
  imagePath: Joi.string(),
  isbn: Joi.string(),
  lowercaseAuthor: Joi.string(),
  lowercaseTitle: Joi.string(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  updatedAtString: Joi.date().iso(),

  bid: Joi.string().optional(),
  id: Joi.string().optional(),
});

export const updateBookSchema = Joi.object({
  author: Joi.string(),
  title: Joi.string(),
  description: Joi.string(),
  genre: Joi.string(),
  imagePath: Joi.string(),
  isbn: Joi.string(),
  lowercaseAuthor: Joi.string(), 
  lowercaseTitle: Joi.string(),
  seriesName: Joi.string(),
  seriesNumber: Joi.string(),
  updatedAtString: Joi.date().iso(),

  bid: Joi.string().forbidden(),
  id: Joi.string(),
});
