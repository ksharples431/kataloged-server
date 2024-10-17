import { HttpStatusCodes } from '../../errors/errorCategories.js';
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

export const getUserGenres = async (req, res, next) => {
  try {
    validateInput(req.query, getUserGenresQuerySchema);
    const { uid } = req.params;
    const { sortBy = 'name', order = 'asc' } = req.query;

    let genres = await fetchAllUserGenres(uid, req.id);

    if (genres.length === 0) {
      const error = new Error('No genres found for this user');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { userId: uid, requestId: req.id };
      return next(error);
    }

    genres = sortBooks(genres, sortBy, order);

    res.status(200).json({
      data: {
        message: 'User genres fetched successfully',
        genres,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserGenreBooks = async (req, res, next) => {
  try {
    validateInput(req.query, getUserGenreBooksQuerySchema);
    const { uid, genre } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;

    let genreBooks = await fetchUserGenreBooks(uid, genre, req.id);

    if (genreBooks.length === 0) {
      const error = new Error('No books found for this user and genre');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { userId: uid, genre, requestId: req.id };
      return next(error);
    }

    const sortedBooks = sortBooks(genreBooks, sortBy, order);
    genreBooks = sortedBooks.map((book) =>
      formatBookCoverResponse(book, req.id)
    );

    res.status(200).json({
      data: {
        message: 'User books by genre fetched successfully',
        books: genreBooks,
      },
    });
  } catch (error) {
    next(error);
  }
};
