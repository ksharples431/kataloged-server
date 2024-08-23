import HttpError from '../../errors/httpErrorModel.js';

import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import {
  createUserBookSchema,
  updateUserBookSchema,
  getUserBooksQuerySchema,
} from './userBookModel.js';
import { formatUserBookDetailsResponse } from './userBookHelpers.js';
import {
  validateInput,
  formatBookCoverResponse,
  sortBooks,
} from '../../utils/globalHelpers.js';
import {
  fetchUserBookById,
  fetchUserBooks,
  createUserBookHelper,
  updateUserBookHelper,
  deleteUserBookHelper,
} from './userBookService.js';


export const getUserBookById = async (req, res) => {
  const { ubid } = req.params;


  let userBook = await fetchUserBookById(ubid);

  if (!userBook) {
    throw new HttpError(
      'User book not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND
    );
  }

  userBook = formatUserBookDetailsResponse(userBook);



  res.status(200).json({
    data: {
      message: 'User book fetched successfully',
      userBook,
    },
  });
};

export const getUserBooks = async (req, res) => {
  validateInput(req.query, getUserBooksQuerySchema);
  const { uid, sortBy = 'title', order = 'asc' } = req.query;

  let userBooks = await fetchUserBooks(uid, sortBy, order);
  const sortedBooks = sortBooks(userBooks, sortBy, order);
  userBooks = sortedBooks.map(formatBookCoverResponse);


  res.status(200).json({
    data: {
      message:
        userBooks.length > 0
          ? 'User books fetched successfully'
          : "No books in user's library",
      userBooks,
    },
  });
};

export const createUserBook = async (req, res) => {
  validateInput(req.body, createUserBookSchema);

  let userBook = await createUserBookHelper(req.body);
  userBook = formatBookCoverResponse(userBook);


  res.status(201).json({
    data: {
      message: 'User book created successfully',
      userBook,
    },
  });
};

export const updateUserBook = async (req, res) => {
  validateInput(req.body, updateUserBookSchema);
  const { ubid } = req.params;
  const updateData = req.body;

  let updatedUserBook = await updateUserBookHelper(ubid, updateData);
  updatedUserBook = formatBookCoverResponse(updatedUserBook);


  res.status(200).json({
    data: {
      message: 'User book updated successfully',
      userBook: updatedUserBook,
    },
  });
};

export const deleteUserBook = async (req, res) => {
  const { ubid } = req.params;
  
  await deleteUserBookHelper(ubid);



  res.status(200).json({
    data: {
      message: 'User book deleted successfully',
    },
  });
};
