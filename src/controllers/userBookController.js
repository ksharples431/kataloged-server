import db from '../config/firebaseConfig.js';

// Relate a book to a user
export const relateBookToUser = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    await db.collection('userBooks').add({ userId, bookId });
    res.status(201).send('Book related to user successfully');
  } catch (error) {
    res.status(500).send('Error relating book to user: ' + error.message);
  }
};

// Get books related to a user
export const getUserBooks = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userBooksQuerySnapshot = await db
      .collection('userBooks')
      .where('userId', '==', userId)
      .get();
    if (userBooksQuerySnapshot.empty) {
      res.status(404).send('No books found for this user');
      return;
    }
    const bookIds = userBooksQuerySnapshot.docs.map(
      (doc) => doc.data().bookId
    );
    const booksPromises = bookIds.map((bookId) =>
      db.collection('books').doc(bookId).get()
    );
    const booksDocs = await Promise.all(booksPromises);
    const books = booksDocs.map((bookDoc) => bookDoc.data());
    res.status(200).json(books);
  } catch (error) {
    res.status(500).send('Error getting user books: ' + error.message);
  }
};

// Get users related to a book
export const getBookUsers = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const bookUsersQuerySnapshot = await db
      .collection('userBooks')
      .where('bookId', '==', bookId)
      .get();
    if (bookUsersQuerySnapshot.empty) {
      res.status(404).send('No users found for this book');
      return;
    }
    const userIds = bookUsersQuerySnapshot.docs.map(
      (doc) => doc.data().userId
    );
    const usersPromises = userIds.map((userId) =>
      db.collection('users').doc(userId).get()
    );
    const usersDocs = await Promise.all(usersPromises);
    const users = usersDocs.map((userDoc) => userDoc.data());
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Error getting book users: ' + error.message);
  }
};
