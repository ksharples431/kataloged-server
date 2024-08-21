import hashSum from 'hash-sum';
import HttpError from '../../../errors/httpErrorModel.js';

export const formatGenreCoverResponse = (book) => {
  try {
    return {
      author: book.author,
      bid: book.bid,
      imagePath: book.imagePath,
      title: book.title,
    };
  } catch (error) {
    throw new HttpError(
      'Error formatting genre response',
      500,
      'GENRE_FORMAT_ERROR',
      { genre }
    );
  }
};

export const generateGid = (genreName) => {
  try {
    const uniqueString = `genre_${genreName}`;
    return `aid_${hashSum(uniqueString).substring(0, 24)}`;
  } catch (error) {
    throw new HttpError(
      'Error generating AID',
      500,
      'GID_GENERATION_ERROR',
      { genreName }
    );
  }
};
