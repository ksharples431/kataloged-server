import HttpError from '../../../models/httpErrorModel.js';

export const formatUserBookCoverResponse = (userBook) => {
  try {
    return {
      author: userBook.author,
      ubid: userBook.ubid,
      imagePath: userBook.imagePath,
      title: userBook.title,
    };
  } catch (error) {
    throw new HttpError(
      'Error formatting user book cover response',
      500,
      'USERBOOK_COVER_FORMAT_ERROR',
      { userBook }
    );
  }
};

export const formatUserBookDetailsResponse = (userBook) => {
  try {
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
    };
  } catch (error) {
    throw new HttpError(
      'Error formatting user book details response',
      500,
      'USERBOOK_DETAILS_FORMAT_ERROR',
      { userBook }
    );
  }
};

export const generateLowercaseFields = (userBook) => {
  try {
    return {
      ...userBook,
      lowercaseTitle: userBook.title ? userBook.title.toLowerCase() : '',
      lowercaseAuthor: userBook.author
        ? userBook.author.toLowerCase()
        : '',
    };
  } catch (error) {
    throw new HttpError(
      'Error generating lowercase fields',
      500,
      'USERBOOK_LOWERCASE_FIELDS_ERROR',
      { userBook }
    );
  }
};
