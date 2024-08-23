import { logEntry } from '../../config/cloudLoggingConfig.js';
import {
  getGenresQuerySchema,
  getGenreBooksQuerySchema,
} from './genreModel.js';
import {
  validateInput,
  sortBooks,
  formatBookCoverResponse,
} from '../../utils/globalHelpers.js';
import {
  fetchAllGenres,
  fetchGenreBooks,
} from './genreService.js';

export const getGenres = async (req, res) => {
  validateInput(req.query, getGenresQuerySchema);
  const { sortBy = 'name', order = 'asc' } = req.query;

  let genres = await fetchAllGenres();
  genres = sortBooks(genres, sortBy, order);

  await logEntry({
    message: `Genres fetched and sorted`,
    severity: 'INFO',
    sortBy,
    order,
    genreCount: genres.length,
  });

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

  let genreBooks = await fetchGenreBooks(genre);
  const sortedBooks = sortBooks(genreBooks, sortBy, order);
  genreBooks = sortedBooks.map(formatBookCoverResponse);

  await logEntry({
    message: `Books by genre fetched and sorted`,
    severity: 'INFO',
    genre,
    sortBy,
    order,
    bookCount: genreBooks.length,
  });

  res.status(200).json({
    data: {
      message: 'Books by genre fetched successfully',
      books: genreBooks,
    },
  });
};
