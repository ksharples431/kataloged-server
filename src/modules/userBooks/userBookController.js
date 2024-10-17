import { HttpStatusCodes } from '../../errors/errorCategories.js';
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

export const getUserBookById = async (req, res, next) => {
  try {
    const { ubid } = req.params;

    let userBook = await fetchUserBookById(ubid, req.id);
    if (!userBook) {
      const error = new Error('User book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      return next(error);
    }

    userBook = formatUserBookDetailsResponse(userBook, req.id);

    res.status(200).json({
      data: {
        message: 'User book fetched successfully',
        userBook,
      },
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

export const getUserBooks = async (req, res, next) => {
  try {
    validateInput(req.query, getUserBooksQuerySchema);
    const { uid, sortBy = 'title', order = 'asc' } = req.query;

    let userBooks = await fetchUserBooks(uid, sortBy, order, req.id);
    const sortedBooks = sortBooks(userBooks, sortBy, order);
    userBooks = sortedBooks.map((book) =>
      formatBookCoverResponse(book, req.id)
    );

    res.status(200).json({
      data: {
        message:
          userBooks.length > 0
            ? 'User books fetched successfully'
            : "No books in user's library",
        userBooks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createUserBook = async (req, res, next) => {
  try {
    validateInput(req.body, createUserBookSchema);

    let userBook = await createUserBookHelper(req.body, req.id);
    userBook = formatBookCoverResponse(userBook, req.id);

    res.status(201).json({
      data: {
        message: 'User book created successfully',
        userBook,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserBook = async (req, res, next) => {
  try {
    validateInput(req.body, updateUserBookSchema);
    const { ubid } = req.params;
    const updateData = req.body;

    let updatedUserBook = await updateUserBookHelper(
      ubid,
      updateData,
      req.id
    );

    if (!updatedUserBook) {
      const error = new Error('User book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      return next(error);
    }

    updatedUserBook = formatBookCoverResponse(updatedUserBook, req.id);

    res.status(200).json({
      data: {
        message: 'User book updated successfully',
        userBook: updatedUserBook,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserBook = async (req, res, next) => {
  try {
    const { ubid } = req.params;

    const deleted = await deleteUserBookHelper(ubid, req.id);
    // if (!deleted) {
    //   const error = new Error('User book not found');
    //   error.statusCode = HttpStatusCodes.NOT_FOUND;
    //   return next(error);
    // }

    res.status(200).json({
      data: {
        message: 'User book deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};
