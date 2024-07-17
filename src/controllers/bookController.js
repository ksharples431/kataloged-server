import { createBookSchema } from '../models/BookModel.js';
import HttpError from '../models/httpErrorModel.js';
import {
  validateInput,
  fetchBookById,
  fetchAllBooks,
  createBookHelper,
  searchBooksInDatabase,
  searchBooksInGoogleAPI,
} from './utils/bookHelpers.js';

export const getBooks = async (req, res, next) => {
  try {
    const { sortBy = 'title', order = 'asc' } = req.query;
    const books = await fetchAllBooks(sortBy, order);

    res.status(200).json({
      message: 'Books fetched successfully',
      books,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { bid } = req.params;
    const book = await fetchBookById(bid);

    res.status(200).json({
      message: 'Book fetched successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (req, res, next) => {
  try {
    validateInput(req.body, createBookSchema);
    const book = await createBookHelper(req.body);

    res.status(201).json({
      message: 'Book created successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

export const searchBook = async (req, res, next) => {
  try {
    const { title, author, isbn } = req.query;

    if (!title && !author && !isbn) {
      throw new HttpError(
        'At least one search parameter (title, author, or isbn) is required',
        400
      );
    }

    const searchParams = { title, author, isbn };

    // Search in your database first
    let books = await searchBooksInDatabase(searchParams);

    if (books.length > 0) {
      res.status(200).json({
        message: 'Books found in database',
        books,
      });
    } else {
      // If not found in database, search Google Books API
      // We need to construct a query string for Google Books API
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

      if (books.length > 0) {
        res.status(200).json({
          message: 'Books found in Google Books API',
          books,
        });
      } else {
        res.status(200).json({
          message: 'No books found',
          books: [],
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

// Update Book
// export const updateBook = async (req, res, next) => {
//   try {
//     validateInput(req.body, updateBookSchema);

//     const { bid } = req.params;
//     const doc = await getDocumentById(bookCollection, bid, 'Book');

//     const currentData = doc.data();
//     const updateData = { ...req.body };

//     delete updateData.id;
//     delete updateData.createdAt;

//     const hasChanges = Object.entries(updateData).some(
//       ([key, value]) => currentData[key] !== value
//     );

//     if (!hasChanges) {
//       const book = formatResponseData(doc);
//       return res
//         .status(200)
//         .json(formatSuccessResponse('No changes detected', { book }));
//     }

//     updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
//     await doc.ref.update(updateData);

//     const updatedDoc = await doc.ref.get();
//     const book = formatResponseData(updatedDoc);

//     res
//       .status(200)
//       .json(formatSuccessResponse('Book updated successfully', { book }));
//   } catch (error) {
//     next(error);
//   }
// };

// Delete Book
// export const deleteBook = async (req, res, next) => {
//   try {
//     const { bid } = req.params;
//     const doc = await getDocumentById(bookCollection, bid, 'Book');

//     await doc.ref.delete();
//     res
//       .status(200)
//       .json(formatSuccessResponse('Book deleted successfully', null));
//   } catch (error) {
//     next(error);
//   }
// };

// Get Authors with book count and sorting
// export const getAuthors = async (req, res, next) => {
//   try {
//     const { sortBy = 'author', order = 'asc' } = req.query;

//     validateSortOptions(sortBy, order);

//     let authors = await mapAuthorsFromBooks();
//     authors = sortBooks(authors, sortBy, order);

//     res
//       .status(200)
//       .json(
//         formatSuccessResponse('Authors fetched successfully', { authors })
//       );
//   } catch (error) {
//     next(error);
//   }
// };

// Get Genres with book count and sorting
// export const getGenres = async (req, res, next) => {
//   try {
//     const { sortBy = 'genre', order = 'asc' } = req.query;

//     validateSortOptions(sortBy, order);

//     let genres = await mapGenresFromBooks();
//     genres = sortBooks(genres, sortBy, order);

//     res
//       .status(200)
//       .json(
//         formatSuccessResponse('Authors fetched successfully', { genres })
//       );
//   } catch (error) {
//     next(error);
//   }
// };

// Get Books by Author with sorting
// export const getBooksByAuthor = async (req, res, next) => {
//   try {
//     const { author } = req.params;
//     const { sortBy = 'title', order = 'asc' } = req.query;
//     validateSortOptions(sortBy, order);

//     let books = await mapAuthorBooks(author);
//     books = sortBooks(books, sortBy, order);

//     res.status(200).json(
//       formatSuccessResponse('Books by author fetched successfully', {
//         books,
//       })
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// Get Books by Genre with sorting
// export const getBooksByGenre = async (req, res, next) => {
//   try {
//     const { genre } = req.params;
//      const { sortBy = 'title', order = 'asc' } = req.query;
//     validateSortOptions(sortBy, order);

//     let books = await mapGenreBooks(genre);
//     books = sortBooks(books, sortBy, order);

//     res.status(200).json(
//       formatSuccessResponse('Books by genre fetched successfully', {
//         books,
//       })
//     );
//   } catch (error) {
//     next(error);
//   }
// };
