import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorConstraints.js';
import {
  getAuthorsQuerySchema,
  getAuthorBooksQuerySchema,
} from './authorModel.js';
import {
  validateInput,
  sortBooks,
  formatBookCoverResponse,
} from '../../utils/globalHelpers.js';
import { fetchAllAuthors, fetchAuthorBooks } from './authorService.js';

export const getAuthors = async (req, res) => {
  validateInput(req.query, getAuthorsQuerySchema);
  const { sortBy = 'name', order = 'asc' } = req.query;

  let authors = await fetchAllAuthors(req.id);
  authors = sortBooks(authors, sortBy, order);

  if (authors.length === 0) {
    throw createCustomError(
      'No authors found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  res.status(200).json({
    data: {
      message: 'Authors fetched successfully',
      authors,
    },
  });
};

export const getAuthorBooks = async (req, res) => {
  validateInput(req.query, getAuthorBooksQuerySchema);
  const { author } = req.params;
  const { sortBy = 'title', order = 'asc' } = req.query;

  let authorBooks = await fetchAuthorBooks(author, req.id);

  if (authorBooks.length === 0) {
    throw createCustomError(
      'No books found for this author',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { author, requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  const sortedBooks = sortBooks(authorBooks, sortBy, order);
  authorBooks = sortedBooks.map((book) =>
    formatBookCoverResponse(book, req.id)
  );

  res.status(200).json({
    data: {
      message: 'Books by author fetched successfully',
      books: authorBooks,
    },
  });
};
