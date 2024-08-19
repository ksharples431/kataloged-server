import HttpError from '../../../models/httpErrorModel.js';

export const validateSortOptions = (sortBy, order) => {
  const validSortFields = ['title', 'name', 'bookCount', 'updatedAt'];
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
