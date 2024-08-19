import HttpError from '../../models/httpErrorModel.js';
import { authorService } from './services/authorService.js';
import { validateSortOptions } from './helpers/validationHelpers.js';
import { sortAuthors } from './helpers/sortingHelpers.js';

export const getAuthors = async (req, res, next) => {
  try {
    const { sortBy = 'name', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let authors = await authorService.mapAuthorsFromBooks();
    authors = sortAuthors(authors, sortBy, order);

    res.status(200).json({
      data: {
        message: 'Authors fetched successfully',
        authors,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to fetch authors',
          500,
          'FETCH_AUTHORS_ERROR',
          {
            sortBy: req.query.sortBy,
            order: req.query.order,
            error: error.message,
          }
        )
      );
    }
  }
};

export const getBooksByAuthor = async (req, res, next) => {
  try {
    const { author } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let authorBooks = await authorService.mapAuthorBooks(author);
    authorBooks = sortAuthors(authorBooks, sortBy, order);

    res.status(200).json({
      data: {
        message: 'Books by author fetched successfully',
        books: authorBooks,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to fetch books by author',
          500,
          'FETCH_AUTHOR_BOOKS_ERROR',
          {
            author,
            sortBy: req.query.sortBy,
            order: req.query.order,
            error: error.message,
          }
        )
      );
    }
  }
};