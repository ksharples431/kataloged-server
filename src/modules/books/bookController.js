import HttpError from '../../models/httpErrorModel.js';
import { createBookSchema, updateBookSchema } from './bookModel.js';
import { buildGoogleQuery } from './helpers/searchHelpers.js';
import { sortBooks } from './helpers/sortingHelpers.js'; 
import {
  validateInput,
  validateSortOptions,
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
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError('Failed to fetch book', 500, 'FETCH_BOOK_ERROR', {
          bid: req.params.bid,
        })
      );
    }
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);
    let books = await fetchAllBooks(sortBy, order);

    books = books.map(formatBookCoverResponse);

    res.status(200).json({
      data: {
        message: 'Books fetched successfully',
        books,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError('Failed to fetch books', 500, 'FETCH_BOOKS_ERROR', {
          sortBy,
          order,
        })
      );
    }
  }
};

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
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError('Failed to create book', 500, 'CREATE_BOOK_ERROR', {
          bookData: req.body,
        })
      );
    }
  }
};

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
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError('Failed to update book', 500, 'UPDATE_BOOK_ERROR', {
          bid: req.params.bid,
          updateData: req.body,
        })
      );
    }
  }
};

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
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError('Failed to delete book', 500, 'DELETE_BOOK_ERROR', {
          bid: req.params.bid,
        })
      );
    }
  }
};

export const searchBook = async (req, res, next) => {
  try {
    const { query } = req.query;
    validateSearchParams({ query });

    let books = await searchBooksInDatabase({ query });

    res.status(200).json({
      data: {
        message: books.length > 0 ? 'Books found' : 'No books found',
        books,
      },
    });
  } catch (error) {
      console.error('Search error:', error);
    next(
      new HttpError('Failed to search books', 500, 'SEARCH_BOOKS_ERROR', {
        searchParams: req.query,
      })
    );
  }
};

export const searchGoogleBooks = async (req, res, next) => {
  try {
    const { query } = req.query;
    validateSearchParams({ query });

    const googleQuery = buildGoogleQuery({ query });
    let books = await searchBooksInGoogleAPI(googleQuery);

    res.status(200).json({
      data: {
        message: books.length > 0 ? 'Books found' : 'No books found',
        books,
      },
    });
  } catch (error) {
    next(
      new HttpError(
        'Failed to search Google Books',
        500,
        'GOOGLE_SEARCH_ERROR',
        { searchParams: req.query }
      )
    );
  }
};