import {
  ValidationError,
  NotFoundError
} from '../../models/httpErrorModel.js';

export const formatResponseData = (doc) => ({
  id: doc.id,
  ...doc.data(),
  updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
});

export const formatSuccessResponse = (message, data) => ({
  message,
  data,
});

export const convertFirestoreTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) {
    return timestamp;
  }
  const date = timestamp.toDate();
  return date.toISOString();
};

export const getDocumentById = async (collection, id) => {
  if (!id) {
    throw new ValidationError( 'Id required');
  }
  const doc = await collection.doc(id).get();
  if (!doc.exists) {
    throw new NotFoundError('Document');
  }
  return doc;
};

export const validateSortOptions = (
  sortBy,
  order,
  validSortBy = ['title', 'author', 'genre', 'updatedAt', 'bookCount'],
  validOrder = ['asc', 'desc']
) => {
  if (!validSortBy.includes(sortBy) || !validOrder.includes(order)) {
    throw new ValidationError('Invalid sort options');
  }
};

export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
};

