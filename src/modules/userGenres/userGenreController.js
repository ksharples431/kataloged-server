// Get Genres with book count and sorting for a specific user
export const getUserGenres = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { sortBy = 'genre', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let genres = await mapGenresFromUserBooks(uid);
    genres = sortBooks(genres, sortBy, order);

    res.status(200).json({
      message: 'User genres fetched successfully',
      genres,
    });
  } catch (error) {
    next(error);
  }
};


// Get User Books by Genre with sorting
export const getUserBooksByGenre = async (req, res, next) => {
  try {
    const { uid, genre } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapUserBooksByGenre(uid, genre);
    books = sortBooks(books, sortBy, order);

    res.status(200).json({
      message: 'User books by genre fetched successfully',
      books,
    });
  } catch (error) {
    next(error);
  }
};