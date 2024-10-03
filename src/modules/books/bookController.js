import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorMappings.js';
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

export const checkBookExists = async (req, res) => {
  const { bid } = req.params;

  const book = await checkBookExistsHelper(bid, req.id);

  res.status(200).json({
    data: {
      exists: !!book,
      book: book,
    },
  });
};

export const getBookById = async (req, res) => {
  const { bid } = req.params;

  let book = await fetchBookById(bid, req.id);

  if (!book) {
    throw createCustomError(
      'Book not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { bookId: bid, requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  book = formatBookDetailsResponse(book, req.id);

  res.status(200).json({
    data: {
      message: 'Book fetched successfully',
      book,
    },
  });
};

export const getBooks = async (req, res) => {
  validateInput(req.query, getBooksQuerySchema);
  const { sortBy = 'title', order = 'asc' } = req.query;

  let books = await fetchAllBooks(req.id);
  const sortedBooks = sortBooks(books, sortBy, order);
  books = sortedBooks.map((book) => formatBookCoverResponse(book, req.id));

  res.status(200).json({
    data: {
      message:
        books.length > 0
          ? 'Books fetched successfully'
          : 'No books in the library',
      books,
    },
  });
};

export const createBook = async (req, res) => {
  validateInput(req.body, createBookSchema);

  let book = await createBookHelper(req.body, req.id);
  book = formatBookCoverResponse(book, req.id);

  res.status(201).json({
    data: {
      message: 'Book created successfully',
      book,
    },
  });
};

export const updateBook = async (req, res) => {
  validateInput(req.body, updateBookSchema);
  const { bid } = req.params;
  const updateData = req.body;

  let updatedBook = await updateBookHelper(bid, updateData, req.id);
  if (!updatedBook) {
    throw createCustomError(
      'Book not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { bookId: bid, requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }
  updatedBook = formatBookCoverResponse(updatedBook, req.id);

  res.status(200).json({
    data: {
      message: 'Book updated successfully',
      book: updatedBook,
    },
  });
};

export const deleteBook = async (req, res) => {
  const { bid } = req.params;

  const deleted = await deleteBookHelper(bid, req.id);
  if (!deleted) {
    throw createCustomError(
      'Book not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { bookId: bid, requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  res.status(200).json({
    data: {
      message: 'Book and related user books deleted successfully',
    },
  });
};