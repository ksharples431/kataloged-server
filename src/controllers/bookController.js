import { db } from '../config/firebaseConfig.js';

export const addBook = async (req, res) => {
  try {
    const book = req.body;
    const bookRef = await db.collection('books').add(book);
    const bookSnapshot = await bookRef.get();
    const newBook = { id: bookSnapshot.id, ...bookSnapshot.data() };
    res.status(201).json(newBook);
  } catch (error) {
    console.error('Error adding book:', error);
    res
      .status(500)
      .json({ message: 'Error adding book', error: error.message });
  }
};

