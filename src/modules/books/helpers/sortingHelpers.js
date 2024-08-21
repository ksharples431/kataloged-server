import HttpError from '../../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../../errors/errorConstraints.js';

export const removeCommonArticles = (title) => {
  const articlesRegex = /^(a |an |the )/i;
  return title.replace(articlesRegex, '').trim();
};

export const getLastName = (name) => {
  const nameArray = name.split(' ');
  return nameArray[nameArray.length - 1];
};

export const sortBooks = (books, sortBy, order) => {
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
        const dateA = new Date(a.updatedAtString);
        const dateB = new Date(b.updatedAtString);
        comparison = dateA.getTime() - dateB.getTime();
        break;
      default:
        throw new HttpError(
          'Invalid sort field',
          HttpStatusCodes.BAD_REQUEST,
          ErrorCodes.INVALID_INPUT,
          { sortBy }
        );
    }

    return order === 'asc' ? comparison : -comparison;
  };

  return books.sort(compareFunction);
};
