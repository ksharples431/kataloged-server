import HttpError from '../../models/httpErrorModel.js';
import { userGenreService } from './services/userGenreService.js';
import { validateSortOptions } from './helpers/validationHelpers.js';
import { sortGenres } from './helpers/sortingHelpers.js';

export const getUserGenres = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { sortBy = 'name', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let genres = await userGenreService.mapUserGenresFromBooks(uid);
    genres = sortGenres(genres, sortBy, order);

    res.status(200).json({
      data: {
        message: 'User genres fetched successfully',
        genres,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to fetch user genres',
          500,
          'FETCH_USER_GENRES_ERROR',
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

export const getUserBooksByGenre = async (req, res, next) => {
  try {
    const { uid, genre } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let genreBooks = await userGenreService.mapUserGenreBooks(uid, genre);
    genreBooks = sortGenres(genreBooks, sortBy, order);

    res.status(200).json({
      data: {
        message: 'User books by genre fetched successfully',
        books: genreBooks,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to fetch user books by genre',
          500,
          'FETCH_USER_GENRE_BOOKS_ERROR',
          {
            uid: req.params.uid,
            genre: req.params.genre,
            sortBy: req.query.sortBy,
            order: req.query.order,
            error: error.message,
          }
        )
      );
    }
  }
};
