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
      throw new HttpError('Book not found', 404);
    }
    return bookDoc.data();
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error fetching book:', error);
    throw new HttpError('Failed to fetch book', 500);
  }
};

export const fetchAllBooks = async (sortBy = 'title', order = 'asc') => {
  try {
    validateSortOptions(sortBy, order);

    const snapshot = await bookCollection.get();
    let books = snapshot.docs.map((doc) => doc.data());

    return sortBooks(books, sortBy, order);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error fetching all books:', error);
    throw new HttpError('Failed to fetch books', 500);
  }
};

export const createBookHelper = async ({
  title,
  author,
  imagePath,
  ...otherFields
}) => {
  try {
    const secureImagePath = imagePath.replace('http://', 'https://');
    const newBook = generateLowercaseFields({
      title,
      author,
      imagePath: secureImagePath,
      updatedAtString: new Date().toISOString(),
      ...otherFields,
    });
    console.log(`${newBook.title} added successfully`);
    const docRef = await bookCollection.add(newBook);
    const bid = docRef.id;
    await docRef.update({ bid });
    return fetchBookById(bid);
  } catch (error) {
    console.error('Error creating book:', error);
    throw new HttpError('Failed to create book', 500);
  }
};

export const updateBookHelper = async (bid, updateData) => {
  try {
    const bookRef = bookCollection.doc(bid);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
      throw new HttpError('Book not found', 404);
    }

    const updatedBook = generateLowercaseFields({
      ...bookDoc.data(),
      ...updateData,
      updatedAtString: new Date().toISOString(),
    });

    await bookRef.update(updatedBook);
    return fetchBookById(bid);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error updating book:', error);
    throw new HttpError('Failed to update book', 500);
  }
};

export const deleteBookHelper = async (bid) => {
  try {
    const bookRef = bookCollection.doc(bid);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
      throw new HttpError('Book not found', 404);
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
    console.error('Error deleting book:', error);
    throw new HttpError('Failed to delete book', 500);
  }
};
