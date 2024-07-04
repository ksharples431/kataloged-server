export const convertFirestoreTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) {
    return timestamp;
  }
  const date = timestamp.toDate();
  return date.toISOString();
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

export const removeCommonArticles = (title) => {
  const articlesRegex = /^(a |an |the )/i;
  return title.replace(articlesRegex, '').trim();
};

export const getLastName = (name) => {
  const nameArray = name.split(' ');
  return nameArray[nameArray.length - 1];
};