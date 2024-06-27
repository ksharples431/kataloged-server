import db from '../config/firebaseConfig.js';
import HttpError from '../models/httpErrorModel.js';
import firebase from 'firebase-admin';

const userBookCollection = db.collection('userBooks');
const bookCollection = db.collection('books');
const userCollection = db.collection('users');

export const relateBookToUser = async (req, res, next) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      throw new HttpError('User ID and Book ID are required', 400);
    }

    // Check if the relation already exists
    const existingRelation = await userBookCollection
      .where('userId', '==', userId)
      .where('bookId', '==', bookId)
      .get();

    if (!existingRelation.empty) {
      throw new HttpError('This book is already related to the user', 409);
    }

    const newRelation = {
      userId,
      bookId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await userBookCollection.add(newRelation);

    res.status(201).json({ message: 'Book related to user successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserBooks = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new HttpError('User ID is required', 400);
    }

    const userBooksQuerySnapshot = await userBookCollection
      .where('userId', '==', userId)
      .get();

    if (userBooksQuerySnapshot.empty) {
      throw new HttpError('No books found for this user', 404);
    }

    const bookIds = userBooksQuerySnapshot.docs.map(
      (doc) => doc.data().bookId
    );
    const booksPromises = bookIds.map((bookId) =>
      bookCollection.doc(bookId).get()
    );
    const booksDocs = await Promise.all(booksPromises);

    const books = booksDocs
      .map((bookDoc) => ({
        id: bookDoc.id,
        ...bookDoc.data(),
      }))
      .filter((book) => book.id); // Filter out any potentially undefined books

    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

export const getBookUsers = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      throw new HttpError('Book ID is required', 400);
    }

    const bookUsersQuerySnapshot = await userBookCollection
      .where('bookId', '==', bookId)
      .get();

    if (bookUsersQuerySnapshot.empty) {
      throw new HttpError('No users found for this book', 404);
    }

    const userIds = bookUsersQuerySnapshot.docs.map(
      (doc) => doc.data().userId
    );
    const usersPromises = userIds.map((userId) =>
      userCollection.doc(userId).get()
    );
    const usersDocs = await Promise.all(usersPromises);

    const users = usersDocs
      .map((userDoc) => ({
        id: userDoc.id,
        ...userDoc.data(),
      }))
      .filter((user) => user.id); // Filter out any potentially undefined users

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
