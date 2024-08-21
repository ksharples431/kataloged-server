import HttpError from '../../errors/httpErrorModel.js';
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
    userBook = formatUserBookDetailsResponse(userBook);
    console.log(userBook);

    res.status(200).json({
      data: {
        message: 'User book fetched successfully',
        userBook: userBook,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to fetch user book',
          500,
          'FETCH_USERBOOK_ERROR',
          {
            ubid: req.params.ubid,
          }
        )
      );
    }
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
      throw new HttpError('User ID is required', 400, 'MISSING_UID');
    }

    let userBooks = await fetchUserBooks(uid, sortBy, order);

    if (full.toLowerCase() !== 'true') {
      userBooks = userBooks.map(formatUserBookCoverResponse);
    }

    res.status(200).json({
      data: {
        message:
          userBooks.length > 0
            ? 'User books fetched successfully'
            : "No books in user's library",
        userBooks: userBooks,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to fetch user books',
          500,
          'FETCH_USERBOOKS_ERROR',
          {
            uid: req.query.uid,
            sortBy: req.query.sortBy,
            order: req.query.order,
            full: req.query.full,
          }
        )
      );
    }
  }
};

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
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to create user book',
          500,
          'CREATE_USERBOOK_ERROR',
          {
            userBookData: req.body,
          }
        )
      );
    }
  }
};

export const updateUserBook = async (req, res, next) => {
  try {
    validateInput(req.body, updateUserBookSchema);
    const { ubid } = req.params;
    const updateData = req.body;
    let updatedUserBook = await updateUserBookHelper(ubid, updateData);
    updatedUserBook = formatUserBookCoverResponse(updatedUserBook);

    res.status(200).json({
      data: {
        message: 'User book updated successfully',
        userBook: updatedUserBook,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to update user book',
          500,
          'UPDATE_USERBOOK_ERROR',
          {
            ubid: req.params.ubid,
            updateData: req.body,
          }
        )
      );
    }
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
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to delete user book',
          500,
          'DELETE_USERBOOK_ERROR',
          {
            ubid: req.params.ubid,
          }
        )
      );
    }
  }
};
