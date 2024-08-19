import HttpError from '../../models/httpErrorModel.js';
import { userAuthorService } from './services/userAuthorService.js';
import { validateSortOptions } from './helpers/validationHelpers.js';
import { sortAuthors } from './helpers/sortingHelpers.js';

export const getUserAuthors = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { sortBy = 'name', order = 'asc' } = req.query;
    console.log(uid)

    validateSortOptions(sortBy, order);

    let authors = await userAuthorService.mapUserAuthorsFromBooks(uid);
    authors = sortAuthors(authors, sortBy, order);
    console.log(authors)

    res.status(200).json({
      data: {
        message: 'User authors fetched successfully',
        authors,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to fetch user authors',
          500,
          'FETCH_USER_AUTHORS_ERROR',
          {
            uid: req.params.uid,
            sortBy: req.query.sortBy,
            order: req.query.order,
            error: error.message,
          }
        )
      );
    }
  }
};

export const getUserBooksByAuthor = async (req, res, next) => {
  try {
    const { uid, author } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let authorBooks = await userAuthorService.mapUserAuthorBooks(
      uid,
      author
    );
    authorBooks = sortAuthors(authorBooks, sortBy, order);

    res.status(200).json({
      data: {
        message: 'User books by author fetched successfully',
        books: authorBooks,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to fetch user books by author',
          500,
          'FETCH_USER_AUTHOR_BOOKS_ERROR',
          {
            uid: req.params.uid,
            author: req.params.author,
            sortBy: req.query.sortBy,
            order: req.query.order,
            error: error.message,
          }
        )
      );
    }
  }
};
