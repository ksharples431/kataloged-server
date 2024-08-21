import HttpError from '../../errors/httpErrorModel.js';
import { genreService } from './services/genreService.js';
import { validateSortOptions } from './helpers/validationHelpers.js';
import { sortGenres } from './helpers/sortingHelpers.js';

export const getGenres = async (req, res, next) => {
  try {
    const { sortBy = 'name', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let genres = await genreService.mapGenresFromBooks();
    genres = sortGenres(genres, sortBy, order);

    res.status(200).json({
      data: {
        message: 'Genres fetched successfully',
        genres,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to fetch genres',
          500,
          'FETCH_GENRES_ERROR',
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

export const getBooksByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let genreBooks = await genreService.mapGenreBooks(genre);
    genreBooks = sortGenres(genreBooks, sortBy, order);

    res.status(200).json({
      data: {
        message: 'Books by genre fetched successfully',
        books: genreBooks,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(
        new HttpError(
          'Failed to fetch books by genre',
          500,
          'FETCH_GENRE_BOOKS_ERROR',
          {
            genre,
            sortBy: req.query.sortBy,
            order: req.query.order,
            error: error.message,
          }
        )
      );
    }
  }
};
