import HttpError from '../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import {
  createBookSchema,
  updateBookSchema,
  getBooksQuerySchema,
} from './bookModel.js';
import {
  formatBookDetailsResponse,
} from './bookHelpers.js';
import {
  validateInput,
  formatBookCoverResponse,
  sortBooks
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

  const book = await checkBookExistsHelper(bid);


  res.status(200).json({
    data: {
      exists: !!book,
      book: book,
    },
  });
};

export const getBookById = async (req, res) => {
  const { bid } = req.params;

  let book = await fetchBookById(bid);

  if (!book) {
    throw new HttpError(
      'Book not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND
    );
  }

  book = formatBookDetailsResponse(book);



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

  let books = await fetchAllBooks();
  const sortedBooks = sortBooks(books, sortBy, order);
  books = sortedBooks.map(formatBookCoverResponse);



  res.status(200).json({
    data: {
      message:
        books.length > 0
          ? 'Books fetched successfully'
          : "No books in the library",
      books,
    },
  });
};

export const createBook = async (req, res) => {
  validateInput(req.body, createBookSchema);

  let book = await createBookHelper(req.body);
  book = formatBookCoverResponse(book);


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

  let updatedBook = await updateBookHelper(bid, updateData);
  updatedBook = formatBookCoverResponse(updatedBook);


  res.status(200).json({
    data: {
      message: 'Book updated successfully',
      book: updatedBook,
    },
  });
};

export const deleteBook = async (req, res) => {
  const { bid } = req.params;
  
  await deleteBookHelper(bid);

  res.status(200).json({
    data: {
      message: 'Book and related user books deleted successfully',
    },
  });
};

