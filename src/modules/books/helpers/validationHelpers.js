import HttpError from '../../../models/httpErrorModel.js';

//todo make this book specific and create same for author/genre
export const validateInput = (data, schema) => {
  try {
    const { error } = schema.validate(data);
    if (error) {
      throw new HttpError(error.details[0].message, 400);
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError('Validation error', 400);
  }
};

export const validateSortOptions = (sortBy, order) => {
  const validSortFields = [
    'title',
    'author',
    'genre',
    'updatedAt',
    'bookCount',
  ];
  const validOrders = ['asc', 'desc'];

  if (!validSortFields.includes(sortBy)) {
    throw new HttpError('Invalid sort field', 400);
  }

  if (!validOrders.includes(order.toLowerCase())) {
    throw new HttpError('Invalid sort order', 400);
  }
};
