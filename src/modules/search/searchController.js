import { HttpStatusCodes } from '../../errors/errorCategories.js';
import {
  validateInput,
  formatBookCoverResponse,
} from '../../utils/globalHelpers.js';
import { searchBookSchema, generalSearchSchema } from './searchModel.js';
import { buildGoogleQuery } from './searchHelpers.js';
import {
  searchBooksInDatabase,
  searchBooksInGoogleAPI,
  searchDatabaseGeneral,
  searchUserBooksByBids,
} from './searchService.js';

export const searchBook = async (req, res, next) => {
  try {
    validateInput(req.query, searchBookSchema);
    const { title, author, isbn } = req.query;

    let books = await searchBooksInDatabase(
      { title, author, isbn },
      req.id
    );

    res.status(200).json({
      data: {
        message: books.length > 0 ? 'Books found' : 'No books found',
        books,
      },
    });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};

export const searchGoogleBooks = async (req, res, next) => {
  try {
    const { title, author, isbn } = req.query;

    if (!title && !author && !isbn) {
      const error = new Error(
        'At least one search parameter (title, author, or isbn) must be provided'
      );
      error.statusCode = HttpStatusCodes.BAD_REQUEST;
      return next(error);
    }

    const googleQuery = buildGoogleQuery({ title, author, isbn });
    let books = await searchBooksInGoogleAPI(googleQuery, 20, req.id);

    res.status(200).json({
      data: {
        message: books.length > 0 ? 'Books found' : 'No books found',
        books,
      },
    });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};

export const generalSearch = async (req, res, next) => {
  try {
    validateInput(req.query, generalSearchSchema);
    const { query, uid } = req.query;

    let allBooks = await searchDatabaseGeneral(query, req.id);
    allBooks = allBooks.map((book) =>
      formatBookCoverResponse(book, req.id)
    );

    let userBooks = [];
    if (uid && allBooks.length > 0) {
      const bids = allBooks.map((book) => book.bid);
      userBooks = await searchUserBooksByBids(uid, bids, req.id);
    }

    res.status(200).json({
      data: {
        message: allBooks.length > 0 ? 'Books found' : 'No books found',
        allBooks,
        userBooks,
      },
    });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};
