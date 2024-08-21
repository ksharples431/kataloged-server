import HttpError from '../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import { logEntry } from '../../config/cloudLoggingConfig.js';
import { validateSortOptions, sortAuthors } from './authorHelpers.js';
import { authorService } from './services/authorService.js';

export const getAuthors = async (req, res) => {
  try {
    const { sortBy = 'name', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let authors = await authorService.mapAuthorsFromBooks();
    authors = sortAuthors(authors, sortBy, order);

    await logEntry({
      message: `Authors fetched and sorted`,
      severity: 'INFO',
      sortBy,
      order,
      authorCount: authors.length,
    });

    res.status(200).json({
      data: {
        message: 'Authors fetched successfully',
        authors,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to fetch authors',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      {
        sortBy: req.query.sortBy,
        order: req.query.order,
        error: error.message,
      }
    );
  }
};

export const getBooksByAuthor = async (req, res) => {
  try {
    const { author } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let authorBooks = await authorService.mapAuthorBooks(author);
    authorBooks = sortAuthors(authorBooks, sortBy, order);

    await logEntry({
      message: `Books by author fetched and sorted`,
      severity: 'INFO',
      author,
      sortBy,
      order,
      bookCount: authorBooks.length,
    });

    res.status(200).json({
      data: {
        message: 'Books by author fetched successfully',
        books: authorBooks,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to fetch books by author',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      {
        author: req.params.author,
        sortBy: req.query.sortBy,
        order: req.query.order,
        error: error.message,
      }
    );
  }
};
