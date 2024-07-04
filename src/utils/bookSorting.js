export const removeCommonArticles = (title) => {
  const articlesRegex = /^(a |an |the )/i;
  return title.replace(articlesRegex, '').trim();
};

export const getLastName = (name) => {
  const nameArray = name.split(' ');
  return nameArray[nameArray.length - 1];
};

export const convertFirestoreTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) {
    return timestamp;
  }
  const date = timestamp.toDate();
  return date.toISOString();
};

export const sortBooks = (books, sortBy, order) => {
  switch (sortBy) {
    case 'title':
      return books.sort((a, b) => {
        const titleA = removeCommonArticles(a.title);
        const titleB = removeCommonArticles(b.title);
        return titleA.localeCompare(titleB);
      });
    case 'author':
      return books.sort((a, b) => {
        const aLastName = getLastName(a.author);
        const bLastName = getLastName(b.author);
        return aLastName.localeCompare(bLastName);
      });
    case 'updatedAt':
      return books.sort((a, b) => {
        const dateA = new Date(convertFirestoreTimestamp(a.updatedAt));
        const dateB = new Date(convertFirestoreTimestamp(b.updatedAt));
        if (isNaN(dateA) || isNaN(dateB)) {
          return 0;
        }
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    default:
      return books;
  }
};