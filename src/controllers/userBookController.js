import firebase from 'firebase-admin';
import HttpError from '../models/httpErrorModel.js';
import { addUserBookSchema, updateUserBookSchema } from '../models/userBookModel.js';
import {
  validateInput,
  createUserBookHelper,
  fetchUserBookById,
  fetchUserBooks,
  fetchBookById,
  validateSortOptions,
  fetchCombinedUserBookData,
  updateBookHelper,
  deleteBookHelper,
  mapAuthorsFromUserBooks,
  mapGenresFromUserBooks,
  mapUserBooksByAuthor,
  mapUserBooksByGenre,
} from './utils/userBookHelpers.js';
import { sortBooks } from './utils/bookSorting.js';

// Debug endpoint
export const debugUserBookStructure = async (req, res, next) => {
  try {
    const { ubid } = req.params;
    const userBook = await fetchUserBookById(ubid);
    const combinedData = await fetchCombinedUserBookData(userBook);
    res.status(200).json({
      message: 'UserBook structure',
      data: {
        userBook,
        combinedUserBook: combinedData,
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
    const userBook = await createUserBookHelper(req.body);
    res.status(201).json({
      message: 'User book created successfully',
      userBook,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Books with sorting
export const getUserBooks = async (req, res, next) => {
  try {
    const { uid, sortBy = 'title', order = 'asc' } = req.query;
    console.log(req.query.uid)
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

// Update User Book
export const updateUserBook = async (req, res, next) => {
  try {
    validateInput(req.body, updateUserBookSchema);

    const { ubid } = req.params;
    const updateData = req.body;

    // Fetch the current user book data
    const currentUserBook = await fetchUserBookById(ubid);

    // Fetch the book data
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

// Get Authors with book count and sorting for a specific user
export const getUserAuthors = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { sortBy = 'author', order = 'asc' } = req.query;
    console.log(`Fetching authors for user: ${uid}`);

    validateSortOptions(sortBy, order);

    let authors = await mapAuthorsFromUserBooks(uid);
    authors = sortBooks(authors, sortBy, order);
    console.log(authors)

    res.status(200).json({
      message: 'User authors fetched successfully',
      authors,
    });
  } catch (error) {
    next(error);
  }
};

// Get Genres with book count and sorting for a specific user
export const getUserGenres = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { sortBy = 'genre', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let genres = await mapGenresFromUserBooks(uid);
    genres = sortBooks(genres, sortBy, order);

    res.status(200).json({
      message: 'User genres fetched successfully',
      genres,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Books by Author with sorting
export const getUserBooksByAuthor = async (req, res, next) => {
  try {
    const { uid, author } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapUserBooksByAuthor(uid, author);
    books = sortBooks(books, sortBy, order);

    res.status(200).json({
      message: 'User books by author fetched successfully',
      books,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Books by Genre with sorting
export const getUserBooksByGenre = async (req, res, next) => {
  try {
    const { uid, genre } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapUserBooksByGenre(uid, genre);
    books = sortBooks(books, sortBy, order);

    res.status(200).json({
      message: 'User books by genre fetched successfully',
      books,
    });
  } catch (error) {
    next(error);
  }
};