import { fetchBookById } from './userBookService.js';
import HttpError from '../../../models/httpErrorModel.js';

// Helper function to combine a single user book with its corresponding book data
const combineBookData = async (userBook) => {
  try {
    const bookData = await fetchBookById(userBook.bid);
    return {
      ...bookData,
      ...userBook,
    };
  } catch (error) {
    console.warn(
      `Failed to fetch book data for bid ${userBook.bid}:`,
      error
    );
    return userBook; // Return just the user book data if book fetch fails
  }
};

// Main helper function to combine books data
export const combineBooksData = async (userBooks) => {
  if (!Array.isArray(userBooks)) {
    // If it's a single book, wrap it in an array
    userBooks = [userBooks];
  }

  const combinedBooks = await Promise.all(userBooks.map(combineBookData));

  // If it was originally a single book, return just that book
  return Array.isArray(userBooks) ? combinedBooks : combinedBooks[0];
};
