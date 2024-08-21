import HttpError from '../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import db from '../../config/firebaseConfig.js';

const userBookCollection = db.collection('userBooks');

// Validation Helpers
export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new HttpError(
      error.details[0].message,
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { data }
    );
  }
};

export const validateSortOptions = (sortBy, order) => {
  const validSortFields = ['title', 'author', 'updatedAt'];
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
export const formatUserBookCoverResponse = (userBook) => {
  if (!userBook || typeof userBook !== 'object') {
    throw new HttpError(
      'Invalid user book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: userBook?.title }
    );
  }
  return {
    author: userBook.author,
    ubid: userBook.ubid,
    imagePath: userBook.imagePath,
    title: userBook.title,
  };
};

export const formatUserBookDetailsResponse = (userBook) => {
  if (!userBook || typeof userBook !== 'object') {
    throw new HttpError(
      'Invalid user book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: userBook?.title }
    );
  }
  return {
    author: userBook.author,
    ubid: userBook.ubid,
    description: userBook.description,
    genre: userBook.genre,
    imagePath: userBook.imagePath,
    isbn: userBook.isbn,
    seriesName: userBook.seriesName,
    seriesNumber: userBook.seriesNumber,
    title: userBook.title,
    favorite: userBook.favorite,
    kataloged: userBook.kataloged,
    owned: userBook.owned,
    wishlist: userBook.wishlist,
    format: userBook.format,
    whereToGet: userBook.whereToGet,
    progress: userBook.progress,
  };
};

export const generateLowercaseFields = (userBook) => {
  if (!userBook || typeof userBook !== 'object') {
    throw new HttpError(
      'Invalid user book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: userBook?.title }
    );
  }
  return {
    ...userBook,
    lowercaseTitle: userBook.title ? userBook.title.toLowerCase() : '',
    lowercaseAuthor: userBook.author ? userBook.author.toLowerCase() : '',
  };
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

export const sortUserBooks = (userBooks, sortBy, order) => {
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

  return userBooks.sort(compareFunction);
};

// Database Helpers
export const executeQuery = async (query) => {
  try {
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    throw new HttpError(
      'Error executing database query',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message }
    );
  }
};
