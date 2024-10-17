import { HttpStatusCodes } from '../../errors/errorCategories.js';
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

export const getAuthors = async (req, res, next) => {
  try {
    // Validate input
    validateInput(req.query, getAuthorsQuerySchema);
    const { sortBy = 'name', order = 'asc' } = req.query;

    // Fetch authors and sort
    let authors = await fetchAllAuthors(req.id);
    authors = sortBooks(authors, sortBy, order);

    if (authors.length === 0) {
      const error = new Error('No authors found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      return next(error);
    }

    // Send response
    res.status(200).json({
      data: {
        message: 'Authors fetched successfully',
        authors,
      },
    });
  } catch (error) {
    next(error); // Pass any error to the global error handler
  }
};

export const getAuthorBooks = async (req, res, next) => {
  try {
    // Validate input
    validateInput(req.query, getAuthorBooksQuerySchema);
    const { author } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;

    // Fetch books by the author
    let authorBooks = await fetchAuthorBooks(author, req.id);

    if (authorBooks.length === 0) {
      const error = new Error('No books found for this author');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      return next(error);
    }

    // Sort books and format the response
    const sortedBooks = sortBooks(authorBooks, sortBy, order);
    authorBooks = sortedBooks.map((book) =>
      formatBookCoverResponse(book, req.id)
    );

    // Send response
    res.status(200).json({
      data: {
        message: 'Books by author fetched successfully',
        books: authorBooks,
      },
    });
  } catch (error) {
    next(error); // Pass any error to the global error handler
  }
};
