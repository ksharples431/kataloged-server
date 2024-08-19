import HttpError from '../../../models/httpErrorModel.js';

export const removeCommonArticles = (title) => {
  const articlesRegex = /^(a |an |the )/i;
  return title.replace(articlesRegex, '').trim();
};

export const getLastName = (name) => {
  const nameArray = name.split(' ');
  return nameArray[nameArray.length - 1];
};

export const sortAuthors = (items, sortBy, order) => {
  try {
    const compareFunction = (a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          // Handle both book titles and author names
          const titleA = removeCommonArticles(a.title || a.name || '');
          const titleB = removeCommonArticles(b.title || b.name || '');
          comparison = titleA.localeCompare(titleB);
          break;
        case 'name':
          const aLastName = getLastName(a.name || a.author || '');
          const bLastName = getLastName(b.name || b.author || '');
          comparison = aLastName.localeCompare(bLastName);
          break;
        case 'bookCount':
          comparison = (a.bookCount || 0) - (b.bookCount || 0);
          break;
        case 'updatedAt':
          const dateA = a.updatedAtString
            ? new Date(a.updatedAtString)
            : new Date(0);
          const dateB = b.updatedAtString
            ? new Date(b.updatedAtString)
            : new Date(0);
          comparison = dateA.getTime() - dateB.getTime();
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

    return items.sort(compareFunction);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError('Error sorting items', 500, 'SORTING_ERROR', {
      sortBy,
      order,
      errorMessage: error.message,
    });
  }
};
