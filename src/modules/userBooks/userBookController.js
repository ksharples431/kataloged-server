import HttpError from '../../models/httpErrorModel.js';
import {
  combineBooksData,
} from './services/combineBooksService.js';
import {
  addUserBookSchema,
  updateUserBookSchema,
} from './userBookModel.js';
import {
  validateInput,
  validateSortOptions,
} from './helpers/validationHelpers.js';
import {
  formatUserBookCoverResponse,
  formatUserBookDetailsResponse,
} from './helpers/utilityHelpers.js';
import {
  fetchUserBookById,
  fetchUserBooks,
  createUserBookHelper,
  updateUserBookHelper,
  deleteUserBookHelper,
} from './services/userBookService.js';

// Get User Book by Id
export const getUserBookById = async (req, res, next) => {
  try {
    const { ubid } = req.params;
    let userBook = await fetchUserBookById(ubid);

    if (!userBook) {
      throw new HttpError('User book not found', 404);
    }

    const combinedBook = await combineBooksData(userBook);
    userBook = formatUserBookDetailsResponse(combinedBook);

    res.status(200).json({
      data: {
        message: 'User book fetched successfully',
        book: userBook,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get User Books with sorting
export const getUserBooks = async (req, res, next) => {
  try {
    const {
      uid,
      sortBy = 'title',
      order = 'asc',
      full = 'false',
    } = req.query;
    validateSortOptions(sortBy, order);

    if (!uid) {
      throw new HttpError('User ID is required', 400);
    }

    let userBooks = await fetchUserBooks(uid, sortBy, order);

    if (userBooks.length === 0) {
      return res.status(200).json({
        data: {
          message: "No books in user's library",
          books: [],
        },
      });
    }

    const combinedBooks = await combineBooksData(userBooks);

    if (full.toLowerCase() !== 'true') {
      userBooks = combinedBooks.map(formatUserBookCoverResponse);
    }

    res.status(200).json({
      data: {
        message: 'User books fetched successfully',
        books: userBooks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create User Book
export const createUserBook = async (req, res, next) => {
  try {
    validateInput(req.body, addUserBookSchema);
    let userBook = await createUserBookHelper(req.body);

    userBook = formatUserBookCoverResponse(userBook);

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

// Update User Book
export const updateUserBook = async (req, res, next) => {
  try {
    validateInput(req.body, updateUserBookSchema);

    const { ubid } = req.params;
    const updateData = req.body;

    let updatedUserBook = await updateUserBookHelper(ubid, updateData);

    const combinedBook = await combineBooksData(updatedUserBook);

    updatedUserBook = formatUserBookCoverResponse(combinedBook);

    res.status(200).json({
      data: {
        message: 'User book updated successfully',
        book: updatedUserBook,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserBook = async (req, res, next) => {
  try {
    const { ubid } = req.params;

    await deleteUserBookHelper(ubid);

    res.status(200).json({
      data: {
        message: 'User book deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};
