import db from '../config/firebaseConfig.js';
import { formatResponseData } from '../utils/formatResponseData.js';

const bookCollection = db.collection('books');

export const fetchCombinedBookData = async (userBookDoc) => {
  const userBookData = formatResponseData(userBookDoc);
  const bookDoc = await bookCollection.doc(userBookData.bid).get();

  if (!bookDoc.exists) {
    console.warn(`Book with id ${userBookData.bid} not found`);
    return null;
  }

  const bookData = formatResponseData(bookDoc);

  return {
    ...userBookData,
    bookInfo: bookData,
  };
};

export const fetchCombinedBooksData = async (userBookDocs) => {
  return Promise.all(userBookDocs.map(fetchCombinedBookData)).then(
    (results) => results.filter(Boolean)
  );
};

