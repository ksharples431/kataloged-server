import hashSum from 'hash-sum';
import HttpError from '../../../models/httpErrorModel.js';

export const formatAuthorCoverResponse = (book) => {
  try {
    return {
      author: book.author,
      bid: book.bid,
      imagePath: book.imagePath,
      title: book.title,
    };
  } catch (error) {
    throw new HttpError(
      'Error formatting author response',
      500,
      'AUTHOR_FORMAT_ERROR',
      { author }
    );
  }
};

export const generateAid = (authorName) => {
  try {
    const uniqueString = `author_${authorName}`;
    return `aid_${hashSum(uniqueString).substring(0, 24)}`;
  } catch (error) {
    throw new HttpError(
      'Error generating AID',
      500,
      'AID_GENERATION_ERROR',
      { authorName }
    );
  }
};
