import db from '../../../config/firebaseConfig.js';
import HttpError from '../../../models/httpErrorModel.js';
import { sortBooks } from '../helpers/sortingHelpers.js';
import { validateSortOptions } from '../helpers/validationHelpers.js';
import { generateLowercaseFields } from '../helpers/utilityHelpers.js';

const bookCollection = db.collection('books');
const userBookCollection = db.collection('userBooks');

export const fetchBookById = async (bid) => {
  try {
    const bookDoc = await bookCollection.doc(bid).get();
    if (!bookDoc.exists) {
      throw new HttpError('Book not found', 404, 'BOOK_NOT_FOUND', {
        bid,
      });
    }
    return bookDoc.data();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError('Failed to fetch book', 500, 'FETCH_BOOK_ERROR', {
      bid,
    });
  }
};

export const fetchAllBooks = async (sortBy = 'title', order = 'asc') => {
  try {
    validateSortOptions(sortBy, order);
    const snapshot = await bookCollection.get();
    let books = snapshot.docs.map((doc) => doc.data());
    return sortBooks(books, sortBy, order);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to fetch books',
      500,
      'FETCH_BOOKS_ERROR',
      { sortBy, order }
    );
  }
};

export const createBookHelper = async ({
  title,
  author,
  imagePath,
  isbn,
  ...otherFields
}) => {
  try {
    if (isbn) {
      const existingBook = await bookCollection
        .where('isbn', '==', isbn)
        .get();
      if (!existingBook.empty) {
        throw new HttpError(
          'A book with this ISBN already exists',
          409,
          'ISBN_ALREADY_EXISTS',
          { isbn }
        );
      }
    }

    const secureImagePath = imagePath.replace('http://', 'https://');
    const newBook = generateLowercaseFields({
      title,
      author,
      imagePath: secureImagePath,
      isbn,
      updatedAtString: new Date().toISOString(),
      ...otherFields,
    });

    const docRef = await bookCollection.add(newBook);
    const bid = docRef.id;
    await docRef.update({ bid });
    return fetchBookById(bid);
  } catch (error) {
    console.error('Error in createBookHelper:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to create book',
      500,
      'CREATE_BOOK_ERROR',
      { title, author, originalError: error.message }
    );
  }
};

export const updateBookHelper = async (bid, updateData) => {
  try {
    const bookRef = bookCollection.doc(bid);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
      throw new HttpError('Book not found', 404, 'BOOK_NOT_FOUND', {
        bid,
      });
    }

    const mergedData = {
      ...bookDoc.data(),
      ...updateData,
      updatedAtString: new Date().toISOString(),
    };

    const updatedBook = generateLowercaseFields(mergedData);

    Object.keys(updatedBook).forEach((key) =>
      updatedBook[key] === undefined ? delete updatedBook[key] : {}
    );

    await bookRef.update(updatedBook);
    return fetchBookById(bid);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to update book',
      500,
      'UPDATE_BOOK_ERROR',
      { bid }
    );
  }
};

export const deleteBookHelper = async (bid) => {
  try {
    const bookRef = bookCollection.doc(bid);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
      throw new HttpError('Book not found', 404, 'BOOK_NOT_FOUND', {
        bid,
      });
    }

    const batch = bookCollection.firestore.batch();

    batch.delete(bookRef);

    const userBooksSnapshot = await userBookCollection
      .where('bid', '==', bid)
      .get();
    userBooksSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error in deleteBookHelper:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to delete book',
      500,
      'DELETE_BOOK_ERROR',
      { bid, originalError: error.message }
    );
  }
};
