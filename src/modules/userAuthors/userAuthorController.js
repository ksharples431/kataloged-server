import { HttpStatusCodes } from '../../errors/errorCategories.js';
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

export const getUserAuthors = async (req, res, next) => {
  try {
    validateInput(req.query, getUserAuthorsQuerySchema);
    const { uid } = req.params;
    const { sortBy = 'name', order = 'asc' } = req.query;

    let authors = await fetchAllUserAuthors(uid, req.id);

    if (authors.length === 0) {
      const error = new Error('No authors found for this user');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { userId: uid, requestId: req.id };
      return next(error);
    }

    authors = sortBooks(authors, sortBy, order);

    res.status(200).json({
      data: {
        message: 'User authors fetched successfully',
        authors,
      },
    });
  } catch (error) {
    next(error); // Pass any errors to the global error handler
  }
};

export const getUserAuthorBooks = async (req, res, next) => {
  try {
    validateInput(req.query, getUserAuthorBooksQuerySchema);
    const { uid, author } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;

    let authorBooks = await fetchUserAuthorBooks(uid, author, req.id);

    if (authorBooks.length === 0) {
      const error = new Error('No books found for this user and author');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { userId: uid, author, requestId: req.id };
      return next(error);
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
  } catch (error) {
    next(error); // Pass any errors to the global error handler
  }
};
