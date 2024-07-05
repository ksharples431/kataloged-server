import Joi from 'joi';
import { ValidationError } from '../models/httpErrorModel.js';

export const createBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  genre: Joi.string(),
  description: Joi.string(),
  imagePath: Joi.string()
});

export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
};
