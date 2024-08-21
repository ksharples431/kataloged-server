import HttpError from '../../errors/httpErrorModel.js';
import {
  validateSortOptions,
  validateSearchParams,
  validateGeneralSearchParams,
  formatBookCoverResponse,
  formatBookDetailsResponse,
  buildGoogleQuery,
} from './bookHelpers.js';
import {
  searchBooksInDatabase,
  searchBooksInGoogleAPI,
  searchDatabaseGeneral,
  searchUserBooksByBids,
} from './services/searchService.js';
import {
  fetchBookById,
  fetchAllBooks,
  createBookHelper,
  updateBookHelper,
  deleteBookHelper,
  checkBookExistsHelper,
} from './services/bookService.js';
import { logEntry } from '../../config/cloudLoggingConfig.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';

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

  await logEntry({
    message: `Book fetched: ${bid}`,
    severity: 'INFO',
    book: book,
  });

  res.status(200).json({
    data: {
      message: 'Book fetched successfully',
      book,
    },
  });
};

export const getBooks = async (req, res) => {
  const { sortBy = 'title', order = 'asc' } = req.query;
  validateSortOptions(sortBy, order);
  let books = await fetchAllBooks(sortBy, order);
  books = books.map(formatBookCoverResponse);

  await logEntry({
    message: `Books fetched. Count: ${books.length}`,
    severity: 'INFO',
    sortBy,
    order,
  });

  res.status(200).json({
    data: {
      message: 'Books fetched successfully',
      books,
    },
  });
};

export const createBook = async (req, res) => {
  let book = await createBookHelper(req.body);
  book = formatBookCoverResponse(book);

  await logEntry({
    message: `Book created: ${book.bid}`,
    severity: 'INFO',
    book: book,
  });

  res.status(201).json({
    data: {
      message: 'Book created successfully',
      book,
    },
  });
};

export const updateBook = async (req, res) => {
  const { bid } = req.params;
  const updateData = req.body;
  let updatedBook = await updateBookHelper(bid, updateData);
  updatedBook = formatBookCoverResponse(updatedBook);

  await logEntry({
    message: `Book updated: ${bid}`,
    severity: 'INFO',
    book: updatedBook,
  });

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

  await logEntry({
    message: `Book deleted: ${bid}`,
    severity: 'INFO',
  });

  res.status(200).json({
    data: {
      message: 'Book and related user books deleted successfully',
    },
  });
};

export const searchBook = async (req, res) => {
  const { title, author, isbn } = req.query;
  validateSearchParams({ title, author, isbn });

  let books = await searchBooksInDatabase({ title, author, isbn });

  await logEntry({
    message: `Book search performed. Results: ${books.length}`,
    severity: 'INFO',
    searchParams: { title, author, isbn },
  });

  res.status(200).json({
    data: {
      message: books.length > 0 ? 'Books found' : 'No books found',
      books,
    },
  });
};

export const searchGoogleBooks = async (req, res) => {
  const { title, author, isbn } = req.query;
  validateSearchParams({ title, author, isbn });

  const googleQuery = buildGoogleQuery({ title, author, isbn });
  let books = await searchBooksInGoogleAPI(googleQuery);

  await logEntry({
    message: `Google Books search performed. Results: ${books.length}`,
    severity: 'INFO',
    searchParams: { title, author, isbn },
  });

  res.status(200).json({
    data: {
      message: books.length > 0 ? 'Books found' : 'No books found',
      books,
    },
  });
};

export const generalSearch = async (req, res) => {
  const { query, uid } = req.query;

  validateGeneralSearchParams(query);

  let allBooks = await searchDatabaseGeneral(query);
  allBooks = allBooks.map(formatBookCoverResponse);

  let userBooks = [];
  if (uid && allBooks.length > 0) {
    const bids = allBooks.map((book) => book.bid);
    userBooks = await searchUserBooksByBids(uid, bids);
  }

  await logEntry({
    message: `General search performed. Results: ${allBooks.length}`,
    severity: 'INFO',
    searchQuery: query,
    uid: uid || 'Not provided',
  });

  res.status(200).json({
    data: {
      message: allBooks.length > 0 ? 'Books found' : 'No books found',
      allBooks,
      userBooks,
    },
  });
};

export const checkBookExists = async (req, res) => {
  const { bid } = req.params;
  const book = await checkBookExistsHelper(bid);

  await logEntry({
    message: `Book existence checked: ${bid}`,
    severity: 'INFO',
    exists: !!book,
  });

  res.status(200).json({
    data: {
      exists: !!book,
      book: book,
    },
  });
};
