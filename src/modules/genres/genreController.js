export const getGenres = async (req, res, next) => {
  try {
    const { sortBy = 'genre', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let genres = await mapGenresFromBooks();
    genres = sortBooks(genres, sortBy, order);

    res
      .status(200)
      .json({ message: 'Genres fetched successfully', genres });
  } catch (error) {
    next(error);
  }
};

export const getBooksByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapGenreBooks(genre);
    books = sortBooks(books, sortBy, order);

    res
      .status(200)
      .json({ message: 'Books by genres fetched successfully', books });
  } catch (error) {
    next(error);
  }
};
