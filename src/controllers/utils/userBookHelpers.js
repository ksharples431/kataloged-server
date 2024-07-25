import firebase from 'firebase-admin';
import HttpError from '../../models/httpErrorModel.js';
import db from '../../config/firebaseConfig.js';
import { sortBooks } from './bookSorting.js';

const userBookCollection = db.collection('userBooks');
const bookCollection = db.collection('books');

export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new HttpError(error.details[0].message, 400);
  }
};

export const createUserBookHelper = async ({
  uid,
  bid,
  ...otherFields
}) => {
  const existingBook = await userBookCollection
    .where('uid', '==', uid)
    .where('bid', '==', bid)
    .get();

  if (!existingBook.empty) {
    throw new HttpError(
      "This book already exists in the user's library",
      409
    );
  }

  const newUserBook = {
    uid,
    bid,
    ...otherFields,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAtString: new Date().toISOString(),
  };

  const docRef = await userBookCollection.add(newUserBook);
  return fetchUserBookById(docRef.id);
};

export const fetchUserBookById = async (ubid) => {
  const userBookDoc = await userBookCollection.doc(ubid).get();
  if (!userBookDoc.exists) {
    throw new HttpError('User Book not found', 404);
  }
  return {
    ubid: userBookDoc.id,
    ...userBookDoc.data(),
  };
};

export const fetchUserBooks = async (
  uid,
  sortBy = 'title',
  order = 'asc'
) => {
  validateSortOptions(sortBy, order);

  const snapshot = await userBookCollection.where('uid', '==', uid).get();

  let userBooks = snapshot.docs.map((doc) => ({
    ...doc.data(),
    ubid: doc.id,
  }));

  const combinedUserBooks = await Promise.all(
    userBooks.map(async (userBook) => {
      const bookData = await fetchBookById(userBook.bid);
      return {
        ...userBook,
        ...bookData,
      };
    })
  );

  return sortBooks(combinedUserBooks, sortBy, order);
};


export const fetchBookById = async (bid) => {
  const bookDoc = await bookCollection.doc(bid).get();
  if (!bookDoc.exists) {
    throw new HttpError('Book not found', 404);
  }
  return {
    bid: bookDoc.id,
    ...bookDoc.data(),
  };
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

export const fetchCombinedUserBookData = async (userBookData) => {
  const bookData = await fetchBookById(userBookData.bid);

  return {
    ...bookData,
    ...userBookData,
  };
};

export const fetchCombinedUserBooksData = async (userBook) => {
  const bookData = await fetchBookById(userBook.bid);
  return {
    ...bookData,
    ...userBook,
  };
};

export const updateBookHelper = async (ubid, updateData) => {
  const userBookRef = userBookCollection.doc(ubid);
  await userBookRef.update(
    {
      ...updateData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtString: new Date().toISOString(),
    },
    { merge: true }
  );

  return fetchUserBookById(ubid);
};

export const deleteBookHelper = async (ubid) => {
  const userBookRef = userBookCollection.doc(ubid);
  // const userBook = await fetchUserBookById(ubid);
  await userBookRef.delete();
  // return userBook;
};

export const mapAuthorsFromUserBooks = async (uid) => {
  const snapshot = await userBookCollection.where('uid', '==', uid).get();
  const authorMap = new Map();

  for (const doc of snapshot.docs) {
    const userBook = doc.data();
    const book = await bookCollection.doc(userBook.bid).get();
    const bookData = book.data();

    if (bookData.author) {
      if (authorMap.has(bookData.author)) {
        authorMap.set(bookData.author, authorMap.get(bookData.author) + 1);
      } else {
        authorMap.set(bookData.author, 1);
      }
    }
  }

  return Array.from(authorMap, ([author, bookCount]) => ({
    author,
    bookCount,
  }));
};

export const mapGenresFromUserBooks = async (uid) => {
  const snapshot = await userBookCollection.where('uid', '==', uid).get();
  const genreMap = new Map();

  for (const doc of snapshot.docs) {
    const userBook = doc.data();
    const book = await bookCollection.doc(userBook.bid).get();
    const bookData = book.data();

    if (bookData.genre) {
      if (genreMap.has(bookData.genre)) {
        genreMap.set(bookData.genre, genreMap.get(bookData.genre) + 1);
      } else {
        genreMap.set(bookData.genre, 1);
      }
    }
  }

  return Array.from(genreMap, ([genre, bookCount]) => ({
    genre,
    bookCount,
  }));
};

export const mapUserBooksByAuthor = async (uid, author) => {
  const snapshot = await userBookCollection.where('uid', '==', uid).get();
  const authorBooks = [];

  for (const doc of snapshot.docs) {
    const userBook = doc.data();
    const book = await bookCollection.doc(userBook.bid).get();
    const bookData = book.data();

    if (bookData.author === author) {
      authorBooks.push({ ...bookData, ...userBook, ubid: doc.id });
    }
  }

  return authorBooks;
};

export const mapUserBooksByGenre = async (uid, genre) => {
  const snapshot = await userBookCollection.where('uid', '==', uid).get();
  const genreBooks = [];

  for (const doc of snapshot.docs) {
    const userBook = doc.data();
    const book = await bookCollection.doc(userBook.bid).get();
    const bookData = book.data();

    if (bookData.genre === genre) {
      genreBooks.push({ ...bookData, ...userBook, ubid: doc.id });
    }
  }

  return genreBooks;
};