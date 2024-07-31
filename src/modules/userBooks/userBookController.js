import HttpError from '../../models/httpErrorModel.js';
import { fetchCombinedUserBookData } from './helpers/combineHelpers.js';
import { addUserBookSchema, updateUserBookSchema } from './userBookModel.js';
import {
  validateInput,
  validateSortOptions,
} from './helpers/validationHelpers.js';
import {
  fetchBookById,
  fetchUserBookById,
  fetchUserBooks,
  createUserBookHelper,
  updateBookHelper,
  deleteBookHelper,
} from './services/userBookService.js';

// Get User Book by Id
export const getUserBookById = async (req, res, next) => {
  try {
    const { ubid } = req.params;

    const userBook = await fetchUserBookById(ubid);
    const combinedData = await fetchCombinedUserBookData(userBook);

    res.status(200).json({
      message: 'User book retrieved successfully',
      userBook: combinedData,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Books with sorting
export const getUserBooks = async (req, res, next) => {
  try {
    const { uid, sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    if (!uid) {
      throw new HttpError('User ID is required', 400);
    }

    const userBooks = await fetchUserBooks(uid, sortBy, order);

    if (userBooks.length === 0) {
      return res.status(200).json({
        message: "No books in user's library",
        userBooks: [],
      });
    }

    res.status(200).json({
      message: 'User books fetched successfully',
      userBooks: userBooks,
    });
  } catch (error) {
    next(error);
  }
};

// Create User Book
export const createUserBook = async (req, res, next) => {
  try {
    validateInput(req.body, addUserBookSchema);
    const userBook = await createUserBookHelper(req.body);
    res.status(201).json({
      message: 'User book created successfully',
      userBook,
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

    const currentUserBook = await fetchUserBookById(ubid);

    const bookData = await fetchBookById(currentUserBook.bid);

    // Combine the data, prioritizing current userBook data
    const currentCombinedData = {
      ...bookData,
      ...currentUserBook,
    };

    // Determine which fields have actually changed
    const changedFields = Object.entries(updateData).reduce(
      (acc, [key, value]) => {
        if (currentCombinedData[key] !== value) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    // If no fields have changed, return early
    if (Object.keys(changedFields).length === 0) {
      return res.status(200).json({
        message: 'No changes detected',
        userBook: currentCombinedData,
      });
    }

    const updatedUserBook = await updateBookHelper(ubid, changedFields);

    // Fetch the updated combined data
     const updatedCombinedData = await fetchCombinedUserBookData(
       updatedUserBook
     );

    res.status(200).json({
      message: 'User book updated successfully',
      userBook: updatedCombinedData,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserBook = async (req, res, next) => {
  try {
    const { ubid } = req.params;

    await deleteBookHelper(ubid);

    res.status(200).json({
      message: 'User book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};






