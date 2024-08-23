import {
  getAuthorsQuerySchema,
  getAuthorBooksQuerySchema,
} from './authorModel.js';
import {
  validateInput,
  sortBooks,
  formatBookCoverResponse,
} from '../../utils/globalHelpers.js';
import {
  fetchAllAuthors,
  fetchAuthorBooks,
} from './authorService.js';

export const getAuthors = async (req, res) => {
  validateInput(req.query, getAuthorsQuerySchema);
  const { sortBy = 'name', order = 'asc' } = req.query;

  let authors = await fetchAllAuthors();
  authors = sortBooks(authors, sortBy, order);

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

  let authorBooks = await fetchAuthorBooks(author);
  const sortedBooks = sortBooks(authorBooks, sortBy, order);
  authorBooks = sortedBooks.map(formatBookCoverResponse);

  res.status(200).json({
    data: {
      message: 'Books by author fetched successfully',
      books: authorBooks,
    },
  });
};
