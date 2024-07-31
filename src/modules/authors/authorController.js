export const getAuthors = async (req, res, next) => {
  try {
    const { sortBy = 'author', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let authors = await mapAuthorsFromBooks();
    authors = sortBooks(authors, sortBy, order);
    console.log(authors);

    res.status(200).json({
      message: 'Authors fetched successfully',
      authors,
    });
  } catch (error) {
    next(error);
  }
};

export const getBooksByAuthor = async (req, res, next) => {
  try {
    const { author } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapAuthorBooks(author);
    books = sortBooks(books, sortBy, order);

    res
      .status(200)
      .json({ message: 'Books by author fetched successfully', books });
  } catch (error) {
    next(error);
  }
};