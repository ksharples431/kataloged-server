import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorConstraints.js';
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

export const getGenres = async (req, res) => {
  validateInput(req.query, getGenresQuerySchema);
  const { sortBy = 'name', order = 'asc' } = req.query;

  let genres = await fetchAllGenres(req.id);
  genres = sortBooks(genres, sortBy, order);

  if (genres.length === 0) {
    throw createCustomError(
      'No genres found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  res.status(200).json({
    data: {
      message: 'Genres fetched successfully',
      genres,
    },
  });
};

export const getGenreBooks = async (req, res) => {
  validateInput(req.query, getGenreBooksQuerySchema);
  const { genre } = req.params;
  const { sortBy = 'title', order = 'asc' } = req.query;

  let genreBooks = await fetchGenreBooks(genre, req.id);

  if (genreBooks.length === 0) {
    throw createCustomError(
      'No books found for this genre',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { genre, requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
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
};