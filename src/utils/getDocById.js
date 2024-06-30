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
