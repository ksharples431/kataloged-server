import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorMappings.js';
import {
  getUserAuthorsQuerySchema,
  getUserAuthorBooksQuerySchema,
} from './userAuthorModel.js';
import {
  validateInput,
  sortBooks,
  formatBookCoverResponse,
} from '../../utils/globalHelpers.js';
import {
  fetchAllUserAuthors,
  fetchUserAuthorBooks,
} from './userAuthorService.js';

export const getUserAuthors = async (req, res) => {
  validateInput(req.query, getUserAuthorsQuerySchema);
  const { uid } = req.params;
  const { sortBy = 'name', order = 'asc' } = req.query;

  let authors = await fetchAllUserAuthors(uid, req.id);

  if (authors.length === 0) {
    throw createCustomError(
      'No authors found for this user',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { userId: uid, requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  authors = sortBooks(authors, sortBy, order);

  res.status(200).json({
    data: {
      message: 'User authors fetched successfully',
      authors,
    },
  });
};

export const getUserAuthorBooks = async (req, res) => {
  validateInput(req.query, getUserAuthorBooksQuerySchema);
  const { uid, author } = req.params;
  const { sortBy = 'title', order = 'asc' } = req.query;

  let authorBooks = await fetchUserAuthorBooks(uid, author, req.id);

  if (authorBooks.length === 0) {
    throw createCustomError(
      'No books found for this user and author',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { userId: uid, author, requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  const sortedBooks = sortBooks(authorBooks, sortBy, order);
  authorBooks = sortedBooks.map((book) =>
    formatBookCoverResponse(book, req.id)
  );

  res.status(200).json({
    data: {
      message: 'User books by author fetched successfully',
      books: authorBooks,
    },
  });
};