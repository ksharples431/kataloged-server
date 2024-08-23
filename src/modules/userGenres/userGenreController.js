import { logEntry } from '../../config/cloudLoggingConfig.js';
import {
  getUserGenresQuerySchema,
  getUserGenreBooksQuerySchema,
} from './userGenreModel.js';
import {
  validateInput,
  sortBooks,
  formatBookCoverResponse,
} from '../../utils/globalHelpers.js';
import {
  fetchAllUserGenres,
  fetchUserGenreBooks,
} from './userGenreService.js';

export const getUserGenres = async (req, res) => {
  validateInput(req.query, getUserGenresQuerySchema);
  const { uid } = req.params;
  const { sortBy = 'name', order = 'asc' } = req.query;

  let genres = await fetchAllUserGenres(uid);
  genres = sortBooks(genres, sortBy, order);

  await logEntry({
    message: `User genres fetched and sorted`,
    severity: 'INFO',
    uid,
    sortBy,
    order,
    genreCount: genres.length,
  });

  res.status(200).json({
    data: {
      message: 'User genres fetched successfully',
      genres,
    },
  });
};

export const getUserGenreBooks = async (req, res) => {
  validateInput(req.query, getUserGenreBooksQuerySchema);
  const { uid, genre } = req.params;
  const { sortBy = 'title', order = 'asc' } = req.query;

  let genreBooks = await fetchUserGenreBooks(uid, genre);
  const sortedBooks = sortBooks(genreBooks, sortBy, order);
  genreBooks = sortedBooks.map(formatBookCoverResponse);

  await logEntry({
    message: `User books by genre fetched and sorted`,
    severity: 'INFO',
    uid,
    genre,
    sortBy,
    order,
    bookCount: genreBooks.length,
  });

  res.status(200).json({
    data: {
      message: 'User books by genre fetched successfully',
      books: genreBooks,
    },
  });
};
