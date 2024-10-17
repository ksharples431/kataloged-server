import { HttpStatusCodes } from '../../errors/errorCategories.js';
import {
  getGenresQuerySchema,
  getGenreBooksQuerySchema,
} from './genreModel.js';
import {
  validateInput,
  sortBooks,
  formatBookCoverResponse,
} from '../../utils/globalHelpers.js';
import { fetchAllGenres, fetchGenreBooks } from './genreService.js';

export const getGenres = async (req, res, next) => {
  try {
    validateInput(req.query, getGenresQuerySchema);
    const { sortBy = 'name', order = 'asc' } = req.query;

    let genres = await fetchAllGenres(req.id);
    genres = sortBooks(genres, sortBy, order);

    if (genres.length === 0) {
      const error = new Error('No genres found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      return next(error);
    }

    res.status(200).json({
      data: {
        message: 'Genres fetched successfully',
        genres,
      },
    });
  } catch (error) {
    next(error); // Pass any errors to the global error handler
  }
};

export const getGenreBooks = async (req, res, next) => {
  try {
    validateInput(req.query, getGenreBooksQuerySchema);
    const { genre } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;

    let genreBooks = await fetchGenreBooks(genre, req.id);

    if (genreBooks.length === 0) {
      const error = new Error('No books found for this genre');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      return next(error);
    }

    const sortedBooks = sortBooks(genreBooks, sortBy, order);
    genreBooks = sortedBooks.map((book) =>
      formatBookCoverResponse(book, req.id)
    );

    res.status(200).json({
      data: {
        message: 'Books by genre fetched successfully',
        books: genreBooks,
      },
    });
  } catch (error) {
    next(error); // Pass any errors to the global error handler
  }
};
