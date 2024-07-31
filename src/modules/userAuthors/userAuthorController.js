// Get Authors with book count and sorting for a specific user
export const getUserAuthors = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { sortBy = 'author', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let authors = await mapAuthorsFromUserBooks(uid);
    authors = sortBooks(authors, sortBy, order);

    res.status(200).json({
      message: 'User authors fetched successfully',
      authors,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Books by Author with sorting
export const getUserBooksByAuthor = async (req, res, next) => {
  try {
    const { uid, author } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapUserBooksByAuthor(uid, author);
    books = sortBooks(books, sortBy, order);

    res.status(200).json({
      message: 'User books by author fetched successfully',
      books,
    });
  } catch (error) {
    next(error);
  }
};