import db from '../../config/firebaseConfig.js';
import HttpError from '../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import {
  generateLowercaseFields,
  executeQuery,
} from '../../utils/globalHelpers.js';

const bookCollection = db.collection('books');
const userBookCollection = db.collection('userBooks');

export const fetchBookById = async (bid) => {
  try {
    const query = bookCollection.doc(bid);
    const [book] = await executeQuery(query);

    if (!book) {
      throw new HttpError(
        'Book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { bid }
      );
    }

    return book;
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

export const fetchAllBooks = async () => {
  try {
    const query = bookCollection;
    return await executeQuery(query);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error fetching all books',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message }
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
      const query = bookCollection.where('isbn', '==', isbn);
      const existingBooks = await executeQuery(query);

      if (existingBooks.length > 0) {
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
    return await fetchBookById(bid);
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
    const query = bookCollection.doc(bid);
    const [book] = await executeQuery(query);

    if (!book) {
      throw new HttpError(
        'Book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { bid }
      );
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
    const query = bookCollection.doc(bid);
    const [book] = await executeQuery(query);

    if (!book) {
      throw new HttpError(
        'Book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { bid }
      );
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
    const query = bookCollection.doc(bid);
    const [book] = await executeQuery(query);
    return book || null;
  } catch (error) {
    throw new HttpError(
      'Error checking book existence',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { bid, error: error.message }
    );
  }
};
