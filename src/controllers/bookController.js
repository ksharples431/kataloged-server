import db from '../config/firebaseConfig.js';
import { sortBooks } from './utils/bookSorting.js';
import {
  getDocumentById,
  validateSortOptions,
} from './utils/bookHelpers.js';

const bookCollection = db.collection('books');

// Get Books with sorting
export const getBooks = async (req, res, next) => {
  try {
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    const snapshot = await bookCollection.get();
    let books = snapshot.docs.map((doc) => ({
      ...doc.data(),
      bid: doc.id,
    }));

    books = sortBooks(books, sortBy, order);

    res.status(200).json({
      message: 'Books fetched successfully',
      books,
    });
  } catch (error) {
    next(error);
  }
};


// Get Book by Id
export const getBookById = async (req, res, next) => {
  try {
    const { bid } = req.params;
    const doc = await getDocumentById(bookCollection, bid, 'Book');

    const book = {
      ...doc.data(),
      bid: doc.id,
    };

    res.status(200).json({
      message: 'Book fetched successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

// Create Book
// export const createBook = async (req, res, next) => {
//   try {
//     validateInput(req.body, createBookSchema);

//     const { title, author, ...otherFields } = req.body;

//     if (!title || !author) {
//       throw new ValidationError('Title and author required');
//     }

//     const newBook = {
//       title,
//       author,
//       ...otherFields,
//       createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//       updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
//     };

//     const docRef = await bookCollection.add(newBook);
//     const doc = await docRef.get();

//     if (!doc.exists) {
//       throw new DatabaseError('create book');
//     }

//     const book = formatResponseData(doc);

//     res
//       .status(201)
//       .json(formatSuccessResponse('Book added successfully', { book }));
//   } catch (error) {
//     next(error);
//   }
// };

// export const searchBook = async (req, res, next) => {
//   try {
//     const { title } = req.query;

//     if (!title) {
//       return res.status(400).json({ error: 'Book title is required' });
//     }

//     // Search in your database first
//     const snapshot = await bookCollection
//       .where('title', '>=', title)
//       .where('title', '<=', title + '\uf8ff')
//       .get();

//     if (!snapshot.empty) {
//       // Book found in the database
//       const books = snapshot.docs.map((doc) =>
//         formatResponseData(doc, 'book')
//       );
//       console.log(books);
//       return res.json({
//         message: 'Books found in database',
//         data: { books },
//       });
//     }
//     console.log(process.env.GOOGLE_BOOKS_API_KEY);

//     try {
//       const googleBooksResponse = await axios.get(
//         'https://www.googleapis.com/books/v1/volumes',
//         {
//           params: {
//             q: title,
//             key: process.env.GOOGLE_BOOKS_API_KEY,
//           },
//           headers: {
//             Referer: 'http://localhost:8080/',
//           },
//         }
//       );

//       if (
//         googleBooksResponse.data.items &&
//         googleBooksResponse.data.items.length > 0
//       ) {
//         console.log(googleBooksResponse.data.items);
//         const googleBooks = googleBooksResponse.data.items.map((item) => ({
//           title: item.volumeInfo.title,
//           authors: item.volumeInfo.authors,
//           description: item.volumeInfo.description,
//           genre: item.volumeInfo.genre,
//           imageLinks: item.volumeInfo.imageLinks,
//           // Add any other fields you want to include
//         }));
//         return res.json({
//           message: 'Books found in Google Books API',
//           data: { books: googleBooks },
//         });
//       } else {
//         return res.status(404).json({ message: 'No books found' });
//       }
//     } catch (googleError) {
//       console.error(
//         'Google Books API Error:',
//         googleError.response
//           ? googleError.response.data
//           : googleError.message
//       );
//       return res
//         .status(503)
//         .json({ error: 'Unable to fetch books from external API' });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

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
