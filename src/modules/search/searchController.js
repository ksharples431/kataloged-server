import HttpError from '../../errors/httpErrorModel.js';
import { logEntry } from '../../config/cloudLoggingConfig.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
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

export const searchBook = async (req, res) => {
  validateInput(req.query, searchBookSchema);
  const { title, author, isbn } = req.query;

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
  validateInput(req.query, searchBookSchema);
  const { title, author, isbn } = req.query;

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
  validateInput(req.query, generalSearchSchema);
  const { query, uid } = req.query;

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
