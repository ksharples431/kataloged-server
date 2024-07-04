import db from '../config/firebaseConfig.js';

const bookCollection = db.collection('books');

// Get Authors 
export const mapAuthorsFromBooks = async () => {
  try {
    const booksSnapshot = await bookCollection.get();
    const authorsMap = new Map();

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
      if (book.author) {
        if (authorsMap.has(book.author)) {
          authorsMap.get(book.author).bookCount += 1;
        } else {
          authorsMap.set(book.author, { name: book.author, bookCount: 1 });
        }
      }
    });

    const authors = Array.from(authorsMap.values());

    return authors;
  } catch (error) {
    console.error('Error mapping authors from books:', error);
    throw new Error('Failed to map authors from books');
  }
};

// Get Genres
export const mapGenresFromBooks = async () => {
  try {
    const booksSnapshot = await bookCollection.get();
    const genresMap = new Map();

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
      if (book.genre) {
        if (genresMap.has(book.genre)) {
          genresMap.get(book.genre).bookCount += 1;
        } else {
          genresMap.set(book.genre, { name: book.genre, bookCount: 1 });
        }
      }
    });

    const genres = Array.from(genresMap.values());

    return genres;
  } catch (error) {
    console.error('Error mapping genres from books:', error);
    throw new Error('Failed to map genres from books');
  }
};

// Get Author's Books
export const mapAuthorBooks = async (author) => {
  try {
    const booksSnapshot = await bookCollection
      .where('author', '==', author)
      .get();

    const books = [];

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
      books.push({
        id: doc.id,
        ...book,
      });
    });

    return books;
  } catch (error) {
    console.error('Error mapping books for author:', error);
    throw new Error('Failed to map books for author');
  }
}; 

// Get Genre's Books
export const mapGenreBooks = async (genre) => {
  try {
    const booksSnapshot = await bookCollection
      .where('genre', '==', genre)
      .get();

    const books = [];

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
      books.push({
        id: doc.id,
        ...book,
      });
    });

    return books;
  } catch (error) {
    console.error('Error mapping books for genre:', error);
    throw new Error('Failed to map books for genre');
  }
};

