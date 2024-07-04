const validateSortOptions = (
  sortBy,
  order,
  validSortBy = ['title', 'author', 'updatedAt'],
  validOrder = ['asc', 'desc']
) => {
  if (!validSortBy.includes(sortBy) || !validOrder.includes(order)) {
    throw new ValidationError('Invalid sort options');
  }
};

const fetchAndSortBooks = async (collection, sortBy, order) => {
  const querySnapshot = await collection.orderBy(sortBy, order).get();
  const items = querySnapshot.docs.map(formatResponseData);
  return items;
};

const handleFetchRequest = async (
  fetchFunction,
  req,
  res,
  next,
  message
) => {
  try {
    const { sortBy = 'title', order = 'asc' } = req.query;
    const validSortBy = ['title', 'author', 'updatedAt'];
    const validOrder = ['asc', 'desc'];

    validateSortOptions(sortBy, order, validSortBy, validOrder);

    const items = await fetchFunction(req, sortBy, order);
    res.status(200).json(formatSuccessResponse(message, { items }));
  } catch (error) {
    next(error);
  }
};

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

export const getDocumentById = async (collection, id, errorMessage) => {
  if (!id) {
    throw new HttpError(`${errorMessage} ID is required`, 400);
  }
  const doc = await collection.doc(id).get();
  if (!doc.exists) {
    throw new HttpError(`${errorMessage} not found`, 404);
  }
  return doc;
};

export const validateInput = (input, schema) => {
  const { error } = schema.validate(input);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
};