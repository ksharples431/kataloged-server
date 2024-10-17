import db from '../../config/firebaseConfig.js';
import { HttpStatusCodes } from '../../errors/errorCategories.js';
import {
  generateLowercaseFields,
  executeQuery,
} from '../../utils/globalHelpers.js';

const bookCollection = db.collection('books');
const userBookCollection = db.collection('userBooks');

export const fetchBookById = async (bid, requestId) => {
  try {
    const query = bookCollection.doc(bid);
    const [book] = await executeQuery(query);

    if (!book) {
      const error = new Error('Book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.requestId = requestId;
      throw error;
    }

    return book;
  } catch (error) {
    error.message = 'Error fetching book: ' + error.message;
    error.statusCode =
      error.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
    error.requestId = requestId;
    throw error;
  }
};

export const fetchAllBooks = async (requestId) => {
  try {
    const query = bookCollection;
    return await executeQuery(query);
  } catch (error) {
    error.message = 'Error fetching all books: ' + error.message;
    error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    error.requestId = requestId;
    throw error;
  }
};

export const createBookHelper = async (
  { title, author, imagePath, isbn, ...otherFields },
  requestId
) => {
  try {
    if (isbn) {
      const query = bookCollection.where('isbn', '==', isbn);
      const existingBooks = await executeQuery(query);

      if (existingBooks.length > 0) {
        const error = new Error('A book with this ISBN already exists');
        error.statusCode = HttpStatusCodes.CONFLICT;
        error.requestId = requestId;
        throw error;
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
    return await fetchBookById(bid);
  } catch (error) {
    error.message = 'Error creating book: ' + error.message;
    error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    error.requestId = requestId;
    throw error;
  }
};

export const updateBookHelper = async (bid, updateData, requestId) => {
  try {
    const query = bookCollection.doc(bid);
    const [book] = await executeQuery(query);

    if (!book) {
      const error = new Error('Book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.requestId = requestId;
      throw error;
    }

    const mergedData = {
      ...book,
      ...updateData,
      updatedAtString: new Date().toISOString(),
    };

    const updatedBook = generateLowercaseFields(mergedData);

    Object.keys(updatedBook).forEach((key) =>
      updatedBook[key] === undefined ? delete updatedBook[key] : {}
    );

    await bookCollection.doc(bid).update(updatedBook);
    return await fetchBookById(bid);
  } catch (error) {
    error.message = 'Error updating book: ' + error.message;
    error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    error.requestId = requestId;
    throw error;
  }
};

export const deleteBookHelper = async (bid, requestId) => {
  try {
    const query = bookCollection.doc(bid);
    const [book] = await executeQuery(query);

    if (!book) {
      const error = new Error('Book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.requestId = requestId;
      throw error;
    }

    const batch = bookCollection.firestore.batch();
    batch.delete(bookCollection.doc(bid));

    const userBooksQuery = userBookCollection.where('bid', '==', bid);
    const userBooks = await executeQuery(userBooksQuery);

    userBooks.forEach((userBook) => {
      batch.delete(userBookCollection.doc(userBook.id));
    });

    await batch.commit();
  } catch (error) {
    error.message = 'Error deleting book: ' + error.message;
    error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    error.requestId = requestId;
    throw error;
  }
};

export const checkBookExistsHelper = async (bid, requestId) => {
  try {
    const query = bookCollection.doc(bid);
    const [book] = await executeQuery(query);
    return book || null;
  } catch (error) {
    error.message = 'Error checking book existence: ' + error.message;
    error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    error.requestId = requestId;
    throw error;
  }
};
