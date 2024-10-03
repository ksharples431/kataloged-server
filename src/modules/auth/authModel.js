import Joi from 'joi';

export const googleSignInSchema = Joi.object({
  idToken: Joi.string().required(),
  // Make email optional, as we can get it from the verified token
  email: Joi.string().email().optional(),
});

export const signupSchema = Joi.object({
  username: Joi.string().min(3).max(15).required(),
  email: Joi.string().email().required(),
});