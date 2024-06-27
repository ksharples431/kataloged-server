import db from '../config/firebaseConfig.js';

// Add a new book
export const addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      imagePath,
      genre,
      description,
      seriesName,
      seriesNumber,
      format,
      owned,
      progress,
      favorite,
      whereToGet,
      wishlist,
    } = req.body;

    // Add the book document without specifying bookId
    const docRef = await db.collection('books').add({
      title,
      author,
      imagePath,
      genre,
      description,
      seriesName,
      seriesNumber,
      format,
      owned,
      progress,
      favorite,
      whereToGet,
      wishlist,
    });

    res.status(201).send(`Book added successfully with ID: ${docRef.id}`);
  } catch (error) {
    res.status(500).send('Error adding book: ' + error.message);
  }
};

// Get a book by ID
export const getBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const bookDoc = await db.collection('books').doc(bookId).get();
    if (bookDoc.exists) {
      res.status(200).json(bookDoc.data());
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    res.status(500).send('Error getting book: ' + error.message);
  }
};

// Get all books
export const getAllBooks = async (req, res) => {
  try {
    const booksSnapshot = await db.collection('books').get();
    const books = [];
    booksSnapshot.forEach((doc) => {
      books.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).send('Error getting books: ' + error.message);
  }
};

// Edit a book by ID
export const editBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const { title, author, publishedYear } = req.body;
    await db
      .collection('books')
      .doc(bookId)
      .update({ title, author, publishedYear });
    res.status(200).send('Book updated successfully');
  } catch (error) {
    res.status(500).send('Error updating book: ' + error.message);
  }
};

// Delete a book by ID
export const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    await db.collection('books').doc(bookId).delete();
    res.status(200).send('Book deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting book: ' + error.message);
  }
};
