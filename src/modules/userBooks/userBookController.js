import HttpError from '../../errors/httpErrorModel.js';
import { logEntry } from '../../config/cloudLoggingConfig.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import {
  addUserBookSchema,
  updateUserBookSchema,
  getUserBooksQuerySchema,
} from './userBookModel.js';
import {
  validateInput,
  validateSortOptions,
  formatUserBookCoverResponse,
  formatUserBookDetailsResponse,
} from './userBookHelpers.js';
import {
  fetchUserBookById,
  fetchUserBooks,
  createUserBookHelper,
  updateUserBookHelper,
  deleteUserBookHelper,
} from './services/userBookService.js';

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

  await logEntry({
    message: `User book fetched: ${ubid}`,
    severity: 'INFO',
    userBook: userBook,
  });

  res.status(200).json({
    data: {
      message: 'User book fetched successfully',
      userBook,
    },
  });
};

export const getUserBooks = async (req, res) => {
  validateInput(req.query, getUserBooksQuerySchema);
  const { uid, sortBy = 'title', order = 'asc', full = false } = req.query;
  validateSortOptions(sortBy, order);

  let userBooks = await fetchUserBooks(uid, sortBy, order);
  if (!full) {
    userBooks = userBooks.map(formatUserBookCoverResponse);
  }

  await logEntry({
    message: `User books fetched. Count: ${userBooks.length}`,
    severity: 'INFO',
    uid,
    sortBy,
    order,
    full,
  });

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
  validateInput(req.body, addUserBookSchema);
  let userBook = await createUserBookHelper(req.body);
  userBook = formatUserBookCoverResponse(userBook);

  await logEntry({
    message: `User book created: ${userBook.ubid}`,
    severity: 'INFO',
    userBook: userBook,
  });

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
  updatedUserBook = formatUserBookCoverResponse(updatedUserBook);

  await logEntry({
    message: `User book updated: ${ubid}`,
    severity: 'INFO',
    userBook: updatedUserBook,
  });

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

  await logEntry({
    message: `User book deleted: ${ubid}`,
    severity: 'INFO',
  });

  res.status(200).json({
    data: {
      message: 'User book deleted successfully',
    },
  });
};
