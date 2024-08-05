import HttpError from '../../../models/httpErrorModel.js';

export const removeCommonArticles = (title) => {
  const articlesRegex = /^(a |an |the )/i;
  return title.replace(articlesRegex, '').trim();
};

export const getLastName = (name) => {
  const nameArray = name.split(' ');
  return nameArray[nameArray.length - 1];
};

export const sortUserBooks = (userBooks, sortBy, order) => {
  try {
    const compareFunction = (a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          const titleA = removeCommonArticles(a.title);
          const titleB = removeCommonArticles(b.title);
          comparison = titleA.localeCompare(titleB);
          break;
        case 'author':
          const aLastName = getLastName(a.author);
          const bLastName = getLastName(b.author);
          comparison = aLastName.localeCompare(bLastName);
          break;
        case 'updatedAt':
          const dateA = a.updatedAtString;
          const dateB = b.updatedAtString;
          if (!isNaN(dateA) && !isNaN(dateB)) {
            comparison = dateA - dateB;
          }
          break;
        case 'genre':
          comparison = a.genre.localeCompare(b.genre);
          break;
        default:
          throw new HttpError(
            'Invalid sort field',
            400,
            'INVALID_SORT_FIELD',
            { sortBy }
          );
      }

      return order === 'asc' ? comparison : -comparison;
    };

    return userBooks.sort(compareFunction);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error sorting user books',
      500,
      'USERBOOK_SORTING_ERROR',
      {
        sortBy,
        order,
      }
    );
  }
};
