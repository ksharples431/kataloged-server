import axios from 'axios';
import hashSum from 'hash-sum';
import firebase from 'firebase-admin';
import db from '../../config/firebaseConfig.js';
import HttpError from '../../models/httpErrorModel.js';
import { sortBooks } from './bookSorting.js';

const bookCollection = db.collection('books');
const userBookCollection = db.collection('userBooks');

export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new HttpError(error.details[0].message, 400);
  }
};

export const validateSortOptions = (sortBy, order) => {
  const validSortFields = [
    'title',
    'author',
    'genre',
    'updatedAt',
    'bookCount',
  ];
  const validOrders = ['asc', 'desc'];

  if (!validSortFields.includes(sortBy)) {
    throw new HttpError('Invalid sort field', 400);
  }

  if (!validOrders.includes(order.toLowerCase())) {
    throw new HttpError('Invalid sort order', 400);
  }
};

export const fetchBookById = async (bid) => {
  const bookDoc = await bookCollection.doc(bid).get();
  if (!bookDoc.exists) {
    throw new HttpError('Book not found', 404);
  }
  return {
    bid: bookDoc.bid,
    ...bookDoc.data(),
  };
};

export const fetchAllBooks = async (sortBy = 'title', order = 'asc') => {
  validateSortOptions(sortBy, order);

  const snapshot = await bookCollection.get();
  let books = snapshot.docs.map((doc) => ({
    ...doc.data(),
    bid: doc.id,
  }));

  return sortBooks(books, sortBy, order);
};

export const createBookHelper = async ({
  title,
  author,
  imagePath,
  ...otherFields
}) => {
  const secureImagePath = imagePath.replace('http://', 'https://');
  const newBook = {
    title,
    author,
    imagePath: secureImagePath,
    ...otherFields,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAtString: new Date().toISOString(),
  };
  console.log(`${newBook.title} added successfully`)
  const docRef = await bookCollection.add(newBook);
  const bid = docRef.id;
  await docRef.update({ bid });
  return fetchBookById(bid);
};

export async function searchBooksInDatabase(searchParams) {
  let query = bookCollection;

  if (searchParams.isbn) {
    // Search by ISBN
    query = query.where('isbn', '==', searchParams.isbn);
  } else if (searchParams.title && searchParams.author) {
    // Search by title and author
    query = query
      .where('title', '>=', searchParams.title)
      .where('title', '<=', searchParams.title + '\uf8ff')
      .where('author', '>=', searchParams.author)
      .where('author', '<=', searchParams.author + '\uf8ff');
  } else if (searchParams.title) {
    // Search by title only
    query = query
      .where('title', '>=', searchParams.title)
      .where('title', '<=', searchParams.title + '\uf8ff');
  } else if (searchParams.author) {
    // Search by author only
    query = query
      .where('author', '>=', searchParams.author)
      .where('author', '<=', searchParams.author + '\uf8ff');
  } else {
    throw new HttpError('Invalid search parameters', 400);
  }

  try {
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({
      bid: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error searching books in database:', error);
    throw new HttpError('Error searching books in database', 500);
  }
}

const generateBid = (item) => {
  const uniqueString = `${item.id}-${item.etag}-${Date.now()}`;
  return `${hashSum(uniqueString)}`.substring(0, 28); 
};

export const searchBooksInGoogleAPI = async (googleQuery) => {
  try {
    if (!googleQuery) {
      throw new HttpError('Invalid search criteria', 400);
    }

    const response = await axios.get(
      'https://www.googleapis.com/books/v1/volumes',
      {
        params: {
          q: googleQuery,
          key: process.env.GOOGLE_BOOKS_API_KEY,
        },
        headers: {
          Referer: process.env.APP_URL || 'http://localhost:8080/',
        },
      }
    );

    if (response.data.items && response.data.items.length > 0) {
      const mappedBooks = response.data.items.map((item) => ({
        bid: generateBid(item),
        title: item.volumeInfo.title || 'Unknown Title',
        author: item.volumeInfo.authors
          ? item.volumeInfo.authors[0]
          : 'Unknown Author',
        description: item.volumeInfo.description || '',
        genre: item.volumeInfo.categories
          ? item.volumeInfo.categories[0]
          : 'Uncategorized',
        imagePath: item.volumeInfo.imageLinks?.thumbnail,
        isbn: item.volumeInfo.industryIdentifiers
          ? item.volumeInfo.industryIdentifiers.find(
              (id) => id.type === 'ISBN_13'
            )?.identifier || 'N/A'
          : 'N/A',
      }));

      const filteredBooks = mappedBooks.filter(
        (book) => book.imagePath && book.description
      );

      return filteredBooks;
    }

    return []; 
  } catch (error) {
    console.error(
      'Google Books API Error:',
      error.response ? error.response.data : error.message
    );
    throw new HttpError('Unable to fetch books from external API', 503);
  }
};

export const updateBookHelper = async (bid, updateData) => {
  const bookRef = bookCollection.doc(bid);
  const bookDoc = await bookRef.get();

  if (!bookDoc.exists) {
    throw new HttpError('Book not found', 404);
  }

  const updatedBook = {
    ...bookDoc.data(),
    ...updateData,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAtString: new Date().toISOString(),
  };

  await bookRef.update(updatedBook);
  return fetchBookById(bid);
};

export const deleteBookHelper = async (bid) => {
  const bookRef = bookCollection.doc(bid);
  const bookDoc = await bookRef.get();

  if (!bookDoc.exists) {
    throw new HttpError('Book not found', 404);
  }

  const batch = bookCollection.firestore.batch();

  // Delete the book from the books collection
  batch.delete(bookRef);

  // Search and delete user books referencing the bid
  const userBooksSnapshot = await userBookCollection
    .where('bid', '==', bid)
    .get();
  userBooksSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Commit the batch
  await batch.commit();
};