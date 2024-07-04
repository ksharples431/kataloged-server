import Joi from 'joi';

const createBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  genre: Joi.string(),
  publicationYear: Joi.number().integer().min(0),
});

export const createBook = async (req, res, next) => {
  try {
    validateInput(req.body, createBookSchema);
    // rest of the function...
  } catch (error) {
    next(error);
  }
};
