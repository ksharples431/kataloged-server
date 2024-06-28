export const convertFirestoreTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) {
    return timestamp;
  }
  const date = timestamp.toDate();
  return date.toISOString();
};

export const formatBookData = (doc) => ({
  id: doc.id,
  ...doc.data(),
  updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
});