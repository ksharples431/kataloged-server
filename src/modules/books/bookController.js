import { HttpStatusCodes } from '../../errors/errorCategories.js'; // Keep only HttpStatusCodes
import {
  createBookSchema,
  updateBookSchema,
  getBooksQuerySchema,
} from './bookModel.js';
import { formatBookDetailsResponse } from './bookHelpers.js';
import {
  validateInput,
  formatBookCoverResponse,
  sortBooks,
} from '../../utils/globalHelpers.js';
import {
  checkBookExistsHelper,
  fetchBookById,
  fetchAllBooks,
  createBookHelper,
  updateBookHelper,
  deleteBookHelper,
} from './bookService.js';

// ==============================
// Controller Methods Refactored
// ==============================

export const checkBookExists = async (req, res, next) => {
  try {
    const { bid } = req.params;
    const book = await checkBookExistsHelper(bid, req.id);

    res.status(200).json({
      data: {
        exists: !!book,
        book: book,
      },
    });
  } catch (error) {
    next(error); // Pass any errors to global error handler
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { bid } = req.params;
    let book = await fetchBookById(bid, req.id);

    if (!book) {
      const error = new Error('Book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      return next(error); // Pass the error to the global error handler
    }

    book = formatBookDetailsResponse(book, req.id);

    res.status(200).json({
      data: {
        message: 'Book fetched successfully',
        book,
      },
    });
  } catch (error) {
    next(error); // Pass any errors to global error handler
  }
};

export const getBooks = async (req, res, next) => {
  try {
    validateInput(req.query, getBooksQuerySchema);
    const { sortBy = 'title', order = 'asc' } = req.query;

    let books = await fetchAllBooks(req.id);
    const sortedBooks = sortBooks(books, sortBy, order);
    books = sortedBooks.map((book) =>
      formatBookCoverResponse(book, req.id)
    );

    res.status(200).json({
      data: {
        message:
          books.length > 0
            ? 'Books fetched successfully'
            : 'No books in the library',
        books,
      },
    });
  } catch (error) {
    next(error); // Pass any errors to global error handler
  }
};

export const createBook = async (req, res, next) => {
  try {
    validateInput(req.body, createBookSchema);

    let book = await createBookHelper(req.body, req.id);
    book = formatBookCoverResponse(book, req.id);

    res.status(201).json({
      data: {
        message: 'Book created successfully',
        book,
      },
    });
  } catch (error) {
    next(error); // Pass any errors to global error handler
  }
};

export const updateBook = async (req, res, next) => {
  try {
    validateInput(req.body, updateBookSchema);
    const { bid } = req.params;
    const updateData = req.body;

    let updatedBook = await updateBookHelper(bid, updateData, req.id);
    if (!updatedBook) {
      const error = new Error('Book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      return next(error); // Pass the error to the global error handler
    }

    updatedBook = formatBookCoverResponse(updatedBook, req.id);

    res.status(200).json({
      data: {
        message: 'Book updated successfully',
        book: updatedBook,
      },
    });
  } catch (error) {
    next(error); // Pass any errors to global error handler
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { bid } = req.params;

    const deleted = await deleteBookHelper(bid, req.id);
    if (!deleted) {
      const error = new Error('Book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      return next(error); // Pass the error to the global error handler
    }

    res.status(200).json({
      data: {
        message: 'Book and related user books deleted successfully',
      },
    });
  } catch (error) {
    next(error); // Pass any errors to global error handler
  }
};
