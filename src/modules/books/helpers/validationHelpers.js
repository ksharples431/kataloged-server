import HttpError from '../../../models/httpErrorModel.js';

export const validateInput = (data, schema) => {
  try {
    const { error } = schema.validate(data);
    if (error) {
      throw new HttpError(
        error.details[0].message,
        400,
        'VALIDATION_ERROR',
        { data }
      );
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Validation error',
      400,
      'UNKNOWN_VALIDATION_ERROR',
      { data }
    );
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
    throw new HttpError('Invalid sort field', 400, 'INVALID_SORT_FIELD', {
      sortBy,
    });
  }

  if (!validOrders.includes(order.toLowerCase())) {
    throw new HttpError('Invalid sort order', 400, 'INVALID_SORT_ORDER', {
      order,
    });
  }
};

export const validateSearchParams = ({ title, author, isbn }) => {
  if (!title && !author && !isbn) {
    throw new HttpError(
      'At least one search parameter (title, author, or isbn) is required',
      400,
      'MISSING_SEARCH_PARAMS'
    );
  }
};

export const validateGeneralSearchParams = (query) => {
  if (!query || query.trim().length === 0) {
    throw new HttpError(
      'Search query cannot be empty',
      400,
      'INVALID_SEARCH_QUERY'
    );
  }
};