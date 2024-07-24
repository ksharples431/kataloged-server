import { createBookSchema } from '../models/bookModel.js';
import HttpError from '../models/httpErrorModel.js';
import {
  validateInput,
  createBookHelper,
  fetchBookById,
  fetchAllBooks,
  updateBookHelper,
  deleteBookHelper,
  searchBooksInDatabase,
  searchBooksInGoogleAPI,
} from './utils/bookHelpers.js';

export const createBook = async (req, res, next) => {
  try {
    validateInput(req.body, createBookSchema);
    const book = await createBookHelper(req.body);

    res.status(201).json({
      message: 'Book created successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const { sortBy = 'title', order = 'asc' } = req.query;
    const books = await fetchAllBooks(sortBy, order);

    res.status(200).json({
      message: 'Books fetched successfully',
      books,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { bid } = req.params;
    const book = await fetchBookById(bid);

    res.status(200).json({
      message: 'Book fetched successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

export const searchBook = async (req, res, next) => {
  try {
    const { title, author, isbn } = req.query;

    if (!title && !author && !isbn) {
      throw new HttpError(
        'At least one search parameter (title, author, or isbn) is required',
        400
      );
    }

    const searchParams = { title, author, isbn };

    // Search in your database first
    let books = await searchBooksInDatabase(searchParams);

    if (books.length > 0) {
      res.status(200).json({
        message: 'Books found in database',
        books,
      });
    } else {
  
      // Google Books API query string
      let googleQuery = '';
      if (isbn) {
        googleQuery = `isbn:${isbn}`;
      } else if (title && author) {
        googleQuery = `intitle:${title}+inauthor:${author}`;
      } else if (title) {
        googleQuery = `intitle:${title}`;
      } else if (author) {
        googleQuery = `inauthor:${author}`;
      }

      books = await searchBooksInGoogleAPI(googleQuery);

      if (books.length > 0) {
        res.status(200).json({
          message: 'Books found in Google Books API',
          books,
        });
      } else {
        res.status(200).json({
          message: 'No books found',
          books: [],
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

// Update Book
export const updateBook = async (req, res, next) => {
  try {
    validateInput(req.body, updateBookSchema);

    const { bid } = req.params;
    const updateData = req.body;

    const updatedBook = await updateBookHelper(bid, updateData);

    res.status(200).json({
      message: 'Book updated successfully',
      book: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { bid } = req.params;

    await deleteBookHelper(bid);

    res.status(200).json({
      message: 'Book and related user books deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get Authors with book count and sorting
export const getAuthors = async (req, res, next) => {
  try {
    const { sortBy = 'author', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let authors = await mapAuthorsFromBooks();
    authors = sortBooks(authors, sortBy, order);

    res.status(200).json({
      message: 'Authors fetched successfully',
      authors,
    });
  } catch (error) {
    next(error);
  }
};

// Get Genres with book count and sorting
export const getGenres = async (req, res, next) => {
  try {
    const { sortBy = 'genre', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let genres = await mapGenresFromBooks();
    genres = sortBooks(genres, sortBy, order);

    res
      .status(200)
      .json({ message: 'Genres fetched successfully', genres });
  } catch (error) {
    next(error);
  }
};

// Get Books by Author with sorting
export const getBooksByAuthor = async (req, res, next) => {
  try {
    const { author } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapAuthorBooks(author);
    books = sortBooks(books, sortBy, order);

    res
      .status(200)
      .json({ message: 'Books by author fetched successfully', books });
  } catch (error) {
    next(error);
  }
};

// Get Books by Genre with sorting
export const getBooksByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapGenreBooks(genre);
    books = sortBooks(books, sortBy, order);

    res.status(200)
      .json({ message: 'Books by genres fetched successfully', books });
  } catch (error) {
    next(error);
  }
};
