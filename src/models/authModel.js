import Joi from 'joi';

export const googleSignInSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const signupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
});