import { fetchBookById } from '../services/userBookService.js';

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
