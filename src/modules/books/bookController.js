import { createBookSchema, updateBookSchema } from './bookModel.js';
import {
  buildGoogleQuery,
  } from './helpers/searchHelpers.js';
import {
  validateInput,
  validateSearchParams,
} from './helpers/validationHelpers.js';
import {
  searchBooksInDatabase,
  searchBooksInGoogleAPI,
} from './services/searchService.js';
import {
  formatBookCoverResponse,
  formatBookDetailsResponse,
} from './helpers/utilityHelpers.js';
import {
  fetchBookById,
  fetchAllBooks,
  createBookHelper,
  updateBookHelper,
  deleteBookHelper,
} from './services/bookService.js';

// Get Book by Id
export const getBookById = async (req, res, next) => {
  try {
    const { bid } = req.params;
    let book = await fetchBookById(bid);

    book = formatBookDetailsResponse(book);

    res.status(200).json({
      data: {
        message: 'Book fetched successfully',
        book,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Books with sorting
export const getBooks = async (req, res, next) => {
  try {
    const { sortBy = 'title', order = 'asc', full = 'false' } = req.query;
    let books = await fetchAllBooks(sortBy, order);

    if (full.toLowerCase() !== 'true') {
      books = books.map(formatBookCoverResponse);
    }

    res.status(200).json({
      data: {
        message: 'Books fetched successfully',
        books,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create Book
export const createBook = async (req, res, next) => {
  try {
    validateInput(req.body, createBookSchema);
    let book = await createBookHelper(req.body);

    book = formatBookCoverResponse(book);

    res.status(201).json({
      data: {
        message: 'Book created successfully',
        book,
      },
    });
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

    let updatedBook = await updateBookHelper(bid, updateData);

    updatedBook = formatBookCoverResponse(updatedBook);

    res.status(200).json({
      data: {
        message: 'Book updated successfully',
        book: updatedBook,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete Book
export const deleteBook = async (req, res, next) => {
  try {
    const { bid } = req.params;

    await deleteBookHelper(bid);

    res.status(200).json({
      data: {
        message: 'Book and related user books deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Search Books
export const searchBook = async (req, res, next) => {
  try {
    const { title, author, isbn } = req.query;

    validateSearchParams({ title, author, isbn });

    let books = await searchBooksInDatabase({ title, author, isbn });

    if (books.length === 0) {
      const googleQuery = buildGoogleQuery({ title, author, isbn });
      books = await searchBooksInGoogleAPI(googleQuery);
    }

    books = books.map(formatBookDetailsResponse);

    res.status(200).json({
      data: {
        message: books.length > 0 ? 'Books found' : 'No books found',
        books,
      },
    });
  } catch (error) {
    next(error);
  }
};
