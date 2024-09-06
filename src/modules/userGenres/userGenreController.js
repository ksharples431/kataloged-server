import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorConstraints.js';
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

  if (genres.length === 0) {
    throw createCustomError(
      'No genres found for this user',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { userId: uid },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  genres = sortBooks(genres, sortBy, order);

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

  if (genreBooks.length === 0) {
    throw createCustomError(
      'No books found for this user and genre',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { userId: uid, genre },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  const sortedBooks = sortBooks(genreBooks, sortBy, order);
  genreBooks = sortedBooks.map(formatBookCoverResponse);

  res.status(200).json({
    data: {
      message: 'User books by genre fetched successfully',
      books: genreBooks,
    },
  });
};
