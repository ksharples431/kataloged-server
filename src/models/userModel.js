import Joi from 'joi';

export const createUserSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
});

export const googleSignInSchema = Joi.object({
  email: Joi.string().email().required(),
  idToken: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  username: Joi.string().optional(),
  email: Joi.string().email().optional(),
});
