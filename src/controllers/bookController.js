import HttpError from '../models/httpErrorModel.js';
import {
  createBookSchema,
  updateBookSchema,
} from '../models/bookModel.js';
import {
  validateInput,
  createBookHelper,
  fetchBookById,
  fetchAllBooks,
  searchBooksInDatabase,
  searchBooksInGoogleAPI,
  updateBookHelper,
  deleteBookHelper,
  validateSortOptions,
  mapAuthorsFromBooks,
  mapGenresFromBooks,
  mapAuthorBooks,
  mapGenreBooks,
} from './utils/bookHelpers.js';
import { sortBooks } from './utils/bookSorting.js';

// Debug endpoint
export const debugBookStructure = async (req, res, next) => {
  try {
    const { bid } = req.params;
    const { full = 'false' } = req.query;
    let book = await fetchBookById(bid);

    if (full.toLowerCase() !== 'true') {
      book = {
        bid: book.bid,
        title: book.title,
        author: book.author,
        imagePath: book.imagePath,
      };
    }

    res.status(200).json({
      data: {
        message: 'Book fetched successfully',
        book,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Get Books with sorting
export const getBooks = async (req, res, next) => {
  try {
    const { sortBy = 'title', order = 'asc', full = 'false' } = req.query;
    let books = await fetchAllBooks(sortBy, order);

    if (full.toLowerCase() !== 'true') {
      books = books.map(({ bid, title, author, imagePath }) => ({
        bid,
        title,
        author,
        imagePath,
      }));
    }

    res.status(200).json({
      data: {
        message: 'Books fetched successfully',
        books,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Book by Id
export const getBookById = async (req, res, next) => {
  try {
    const { bid } = req.params;
    const book = await fetchBookById(bid);

    res.status(200).json({
      data: {
        message: 'Book fetched successfully',
        book,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create Book
export const createBook = async (req, res, next) => {
  try {
    validateInput(req.body, createBookSchema);
    let book = await createBookHelper(req.body);
    console.log(req.body)

    book = {
      bid: book.bid,
      title: book.title,
      author: book.author,
      imagePath: book.imagePath,
    };

    res.status(201).json({
      data: {
        message: 'Book created successfully',
        book,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update Book
export const updateBook = async (req, res, next) => {
  try {
    validateInput(req.body, updateBookSchema);

    const { bid } = req.params;
    const updateData = req.body;

    let updatedBook = await updateBookHelper(bid, updateData);

    updatedBook = {
      bid: updatedBook.bid,
      title: updatedBook.title,
      author: updatedBook.author,
      imagePath: updatedBook.imagePath,
    };

    res.status(200).json({
      data: {
        message: 'Book updated successfully',
        book: updatedBook,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete Book
export const deleteBook = async (req, res, next) => {
  try {
    const { bid } = req.params;

    await deleteBookHelper(bid);

    res.status(200).json({
      data: {
        message: 'Book and related user books deleted successfully',
      }
    });
  } catch (error) {
    next(error);
  }
};

// Search Books
export const searchBook = async (req, res, next) => {
  try {
    const { title, author, isbn, full = 'false' } = req.query;

    if (!title && !author && !isbn) {
      throw new HttpError(
        'At least one search parameter (title, author, or isbn) is required',
        400
      );
    }

    const searchParams = { title, author, isbn };

    let books = await searchBooksInDatabase(searchParams);

    if (books.length === 0) {
      let googleQuery = '';
      if (isbn) {
        googleQuery = `isbn:${isbn}`;
      } else if (title && author) {
        googleQuery = `intitle:${title}+inauthor:${author}`;
      } else if (title) {
        googleQuery = `intitle:${title}`;
      } else if (author) {
        googleQuery = `inauthor:${author}`;
      }

      books = await searchBooksInGoogleAPI(googleQuery);
    }

    if (full.toLowerCase() !== 'true') {
      books = books.map(({ bid, title, author, imagePath }) => ({
        bid,
        title,
        author,
        imagePath,
      }));
    }

    res.status(200).json({
      data: {
        message: books.length > 0 ? 'Books found' : 'No books found',
        books,
      }
    });
  } catch (error) {
    next(error);
  }
};


// Get Authors with book count and sorting
export const getAuthors = async (req, res, next) => {
  try {
    const { sortBy = 'author', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let authors = await mapAuthorsFromBooks();
    authors = sortBooks(authors, sortBy, order);
    console.log(authors)

    res.status(200).json({
      message: 'Authors fetched successfully',
      authors,
    });
  } catch (error) {
    next(error);
  }
};

// Get Genres with book count and sorting
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

// Get Books by Author with sorting
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

// Get Books by Genre with sorting
export const getBooksByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapGenreBooks(genre);
    books = sortBooks(books, sortBy, order);

    res.status(200)
      .json({ message: 'Books by genres fetched successfully', books });
  } catch (error) {
    next(error);
  }
};
