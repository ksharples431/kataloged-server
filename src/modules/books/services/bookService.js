import db from '../../../config/firebaseConfig.js';
import HttpError from '../../../errors/httpErrorModel.js';
import { logEntry } from '../../../config/cloudLoggingConfig.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../../errors/errorConstraints.js';
import { generateLowercaseFields, validateSortOptions, sortBooks } from '../bookHelpers.js'

const bookCollection = db.collection('books');
const userBookCollection = db.collection('userBooks');

export const fetchBookById = async (bid) => {
  try {
    const bookDoc = await bookCollection.doc(bid).get();
    if (!bookDoc.exists) {
      throw new HttpError(
        'Book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { bid }
      );
    }

    await logEntry({
      message: `Book fetched by ID`,
      severity: 'INFO',
      bid,
    });

    return bookDoc.data();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error fetching book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { bid, error: error.message }
    );
  }
};

export const fetchAllBooks = async (sortBy = 'title', order = 'asc') => {
  try {
    validateSortOptions(sortBy, order);
    const snapshot = await bookCollection.get();
    let books = snapshot.docs.map((doc) => doc.data());
    const sortedBooks = sortBooks(books, sortBy, order);

    await logEntry({
      message: `All books fetched and sorted`,
      severity: 'INFO',
      sortBy,
      order,
      bookCount: sortedBooks.length,
    });

    return sortedBooks;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error fetching all books',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { sortBy, order, error: error.message }
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
          HttpStatusCodes.CONFLICT,
          ErrorCodes.RESOURCE_ALREADY_EXISTS,
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
    const createdBook = await fetchBookById(bid);

    await logEntry({
      message: `New book created`,
      severity: 'INFO',
      bid,
      title,
      author,
    });

    return createdBook;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error creating book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { title, author, isbn, error: error.message }
    );
  }
};

export const updateBookHelper = async (bid, updateData) => {
  try {
    const bookRef = bookCollection.doc(bid);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
      throw new HttpError(
        'Book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { bid }
      );
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
    const fetchedUpdatedBook = await fetchBookById(bid);

    await logEntry({
      message: `Book updated`,
      severity: 'INFO',
      bid,
      updatedFields: Object.keys(updateData),
    });

    return fetchedUpdatedBook;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error updating book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { bid, updateData, error: error.message }
    );
  }
};

export const deleteBookHelper = async (bid) => {
  try {
    const bookRef = bookCollection.doc(bid);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
      throw new HttpError(
        'Book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { bid }
      );
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

    await logEntry({
      message: `Book and related user books deleted`,
      severity: 'INFO',
      bid,
      deletedUserBooksCount: userBooksSnapshot.size,
    });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error deleting book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { bid, error: error.message }
    );
  }
};

export const checkBookExistsHelper = async (bid) => {
  try {
    const bookDoc = await bookCollection.doc(bid).get();
    const exists = bookDoc.exists;

    await logEntry({
      message: `Book existence checked`,
      severity: 'INFO',
      bid,
      exists,
    });

    return exists ? bookDoc.data() : null;
  } catch (error) {
    throw new HttpError(
      'Error checking book existence',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { bid, error: error.message }
    );
  }
};
