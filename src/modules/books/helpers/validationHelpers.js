import HttpError from '../../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../../errors/errorConstraints.js';

export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new HttpError(
      error.details[0].message,
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
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
    throw new HttpError(
      'Invalid sort field',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      {
        sortBy,
      }
    );
  }

  if (!validOrders.includes(order.toLowerCase())) {
    throw new HttpError(
      'Invalid sort order',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      {
        order,
      }
    );
  }
};

export const validateSearchParams = ({ title, author, isbn }) => {
  if (!title && !author && !isbn) {
    throw new HttpError(
      'At least one search parameter (title, author, or isbn) is required',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT
    );
  }
};

export const validateGeneralSearchParams = (query) => {
  if (!query || query.trim().length === 0) {
    throw new HttpError(
      'Search query cannot be empty',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT
    );
  }
};
