
import {
  getUserAuthorsQuerySchema,
  getUserAuthorBooksQuerySchema,
} from './userAuthorModel.js';
import {
  validateInput,
  sortBooks,
  formatBookCoverResponse,
} from '../../utils/globalHelpers.js';
import {
  fetchAllUserAuthors,
  fetchUserAuthorBooks,
} from './userAuthorService.js';

export const getUserAuthors = async (req, res) => {
  validateInput(req.query, getUserAuthorsQuerySchema);
  const { uid } = req.params;
  const { sortBy = 'name', order = 'asc' } = req.query;

  let authors = await fetchAllUserAuthors(uid);
  authors = sortBooks(authors, sortBy, order);

 

  res.status(200).json({
    data: {
      message: 'User authors fetched successfully',
      authors,
    },
  });
};

export const getUserAuthorBooks = async (req, res) => {
  validateInput(req.query, getUserAuthorBooksQuerySchema);
  const { uid, author } = req.params;
  const { sortBy = 'title', order = 'asc' } = req.query;

  let authorBooks = await fetchUserAuthorBooks(uid, author);
  const sortedBooks = sortBooks(authorBooks, sortBy, order);
  authorBooks = sortedBooks.map(formatBookCoverResponse);



  res.status(200).json({
    data: {
      message: 'User books by author fetched successfully',
      books: authorBooks,
    },
  });
};
