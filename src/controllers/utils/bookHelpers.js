import axios from 'axios';
import hashSum from 'hash-sum';
import db from '../../config/firebaseConfig.js';
import HttpError from '../../models/httpErrorModel.js';
import { sortBooks } from './bookSorting.js';

const bookCollection = db.collection('books');
const userBookCollection = db.collection('userBooks');

export const validateInput = (data, schema) => {
  try {
    const { error } = schema.validate(data);
    if (error) {
      throw new HttpError(error.details[0].message, 400);
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError('Validation error', 400);
  }
};

export const generateLowercaseFields = (book) => {
  return {
    ...book,
    lowercaseTitle: book.title ? book.title.toLowerCase() : '',
    lowercaseAuthor: book.author ? book.author.toLowerCase() : '',
  };
};

export const createBookHelper = async ({
  title,
  author,
  imagePath,
  ...otherFields
}) => {
  try {
    const secureImagePath = imagePath.replace('http://', 'https://');
    const newBook = generateLowercaseFields({
      title,
      author,
      imagePath: secureImagePath,
      updatedAtString: new Date().toISOString(),
      ...otherFields,
    });
    console.log(`${newBook.title} added successfully`);
    const docRef = await bookCollection.add(newBook);
    const bid = docRef.id;
    await docRef.update({ bid });
    return fetchBookById(bid);
  } catch (error) {
    console.error('Error creating book:', error);
    throw new HttpError('Failed to create book', 500);
  }
};

export const fetchBookById = async (bid) => {
  try {
    const bookDoc = await bookCollection.doc(bid).get();
    if (!bookDoc.exists) {
      throw new HttpError('Book not found', 404);
    }
    return bookDoc.data();
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error fetching book:', error);
    throw new HttpError('Failed to fetch book', 500);
  }
};

export const fetchAllBooks = async (sortBy = 'title', order = 'asc') => {
  try {
    validateSortOptions(sortBy, order);

    const snapshot = await bookCollection.get();
    let books = snapshot.docs.map((doc) => doc.data());

    return sortBooks(books, sortBy, order);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error fetching all books:', error);
    throw new HttpError('Failed to fetch books', 500);
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

export const updateBookHelper = async (bid, updateData) => {
  try {
    const bookRef = bookCollection.doc(bid);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
      throw new HttpError('Book not found', 404);
    }

    const updatedBook = generateLowercaseFields({
      ...bookDoc.data(),
      ...updateData,
      updatedAtString: new Date().toISOString(),
    });

    await bookRef.update(updatedBook);
    return fetchBookById(bid);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error updating book:', error);
    throw new HttpError('Failed to update book', 500);
  }
};

export const deleteBookHelper = async (bid) => {
  try {
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
  } catch (error) {
    console.error('Error deleting book:', error);
    throw new HttpError('Failed to delete book', 500);
  }
};

export async function searchBooksInDatabase(searchParams) {
  if (!searchParams.isbn && !searchParams.title && !searchParams.author) {
    throw new HttpError('At least one search parameter is required', 400);
  }

  let query = bookCollection;

  if (searchParams.isbn) {
    query = query.where('isbn', '==', searchParams.isbn);
  } else {
    if (searchParams.title && searchParams.author) {
      const titleLower = searchParams.title.toLowerCase();
      const authorLower = searchParams.author.toLowerCase();
      query = query
        .where('lowercaseTitle', '>=', titleLower)
        .where('lowercaseTitle', '<', titleLower + '\uf8ff')
        .where('lowercaseAuthor', '>=', authorLower)
        .where('lowercaseAuthor', '<', authorLower + '\uf8ff');
    } else if (searchParams.title) {
      const titleLower = searchParams.title.toLowerCase();
      query = query
        .where('lowercaseTitle', '>=', titleLower)
        .where('lowercaseTitle', '<', titleLower + '\uf8ff');
    } else if (searchParams.author) {
      const authorLower = searchParams.author.toLowerCase();
      query = query
        .where('lowercaseAuthor', '>=', authorLower)
        .where('lowercaseAuthor', '<', authorLower + '\uf8ff');
    }
  }

  try {
    const snapshot = await query.get();
    let books = snapshot.docs.map((doc) => doc.data());

    return books
  } catch (error) {
    console.error('Error searching books in database:', error);
    throw new HttpError('Error searching books in database', 500);
  }
}

export const searchBooksInGoogleAPI = async (googleQuery) => {
  const GOOGLE_BOOKS_API_URL =
    'https://www.googleapis.com/books/v1/volumes';
    
  if (!googleQuery) {
    throw new HttpError('Invalid search criteria', 400);
  }

  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: googleQuery,
        key: process.env.GOOGLE_BOOKS_API_KEY,
      },
      headers: {
        Referer: process.env.APP_URL_PROD || process.env.APP_URL_LOCAL,
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }

    return response.data.items
      .map(mapBookItem)
      .filter((book) => book.imagePath && book.description);
  } catch (error) {
    console.error(
      'Google Books API Error:',
      error.response?.data || error.message
    );
    throw new HttpError('Unable to fetch books from external API', 503);
  }
};

const mapBookItem = (item) => ({
  bid: generateBid(item),
  title: item.volumeInfo.title || 'Unknown Title',
  author: item.volumeInfo.authors?.[0] || 'Unknown Author',
  description: item.volumeInfo.description || '',
  genre: item.volumeInfo.categories?.[0] || 'Uncategorized',
  imagePath: item.volumeInfo.imageLinks?.thumbnail,
  isbn: findISBN13(item.volumeInfo.industryIdentifiers),
  lowercaseTitle: (item.volumeInfo.title || 'Unknown Title').toLowerCase(),
  lowercaseAuthor: (
    item.volumeInfo.authors?.[0] || 'Unknown Author'
  ).toLowerCase(),
});

const generateBid = (item) => {
  const uniqueString = `${item.id}-${item.etag}-${Date.now()}`;
  return hashSum(uniqueString).substring(0, 28);
};

const findISBN13 = (industryIdentifiers) => {
  if (!industryIdentifiers) return 'N/A';
  const isbn13 = industryIdentifiers.find((id) => id.type === 'ISBN_13');
  return isbn13 ? isbn13.identifier : 'N/A';
};

const mapCategoryFromBooks = async (categoryField) => {
  try {
    const booksSnapshot = await bookCollection.get();
    const categoryMap = new Map();

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
      const categoryValue = book[categoryField];
      if (categoryValue) {
        if (categoryMap.has(categoryValue)) {
          categoryMap.get(categoryValue).bookCount += 1;
        } else {
          categoryMap.set(categoryValue, {
            [categoryField]: categoryValue,
            bookCount: 1,
          });
        }
      }
    });

    return Array.from(categoryMap.values());
  } catch (error) {
    console.error(`Error mapping ${categoryField} from books:`, error);
    throw new Error(
      `Failed to map ${categoryField} from books: ${error.message}`
    );
  }
};

// Get Authors
export const mapAuthorsFromBooks = () => mapCategoryFromBooks('author');

// Get Genres
export const mapGenresFromBooks = () => mapCategoryFromBooks('genre');

// Generic function to map books by category
const mapBooksByCategory = async (categoryField, categoryValue) => {
  try {
    const booksSnapshot = await bookCollection
      .where(categoryField, '==', categoryValue)
      .get();

    return booksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error mapping books for ${categoryField}:`, error);
    throw new Error(
      `Failed to map books for ${categoryField}: ${error.message}`
    );
  }
};

// Get Author's Books
export const mapAuthorBooks = (author) =>
  mapBooksByCategory('author', author);

// Get Genre's Books
export const mapGenreBooks = (genre) => mapBooksByCategory('genre', genre);
