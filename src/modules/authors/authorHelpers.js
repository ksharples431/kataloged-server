import HttpError from '../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import hashSum from 'hash-sum';

// Validation Helpers
export const validateSortOptions = (sortBy, order) => {
  const validSortFields = ['title', 'name', 'bookCount', 'updatedAt'];
  const validOrders = ['asc', 'desc'];

  if (!validSortFields.includes(sortBy)) {
    throw new HttpError(
      'Invalid sort field',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { sortBy }
    );
  }

  if (!validOrders.includes(order.toLowerCase())) {
    throw new HttpError(
      'Invalid sort order',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { order }
    );
  }
};

// Utility Helpers
export const formatAuthorCoverResponse = (book) => {
  if (!book || typeof book !== 'object') {
    throw new HttpError(
      'Invalid book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: book?.title }
    );
  }
  return {
    author: book.author,
    bid: book.bid,
    imagePath: book.imagePath,
    title: book.title,
  };
};

export const generateAid = (authorName) => {
  try {
    const uniqueString = `author_${authorName}`;
    return `aid_${hashSum(uniqueString).substring(0, 24)}`;
  } catch (error) {
    throw new HttpError(
      'Error generating AID',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INTERNAL_SERVER_ERROR,
      { authorName, error: error.message }
    );
  }
};

// Sorting Helpers
const removeCommonArticles = (title) => {
  const articlesRegex = /^(a |an |the )/i;
  return title.replace(articlesRegex, '').trim();
};

const getLastName = (name) => {
  const nameArray = name.split(' ');
  return nameArray[nameArray.length - 1];
};

export const sortAuthors = (items, sortBy, order) => {
  const compareFunction = (a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
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
          HttpStatusCodes.BAD_REQUEST,
          ErrorCodes.INVALID_INPUT,
          { sortBy }
        );
    }

    return order === 'asc' ? comparison : -comparison;
  };

  return items.sort(compareFunction);
};
