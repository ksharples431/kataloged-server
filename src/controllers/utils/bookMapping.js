import db from '../../config/firebaseConfig.js';

const bookCollection = db.collection('books');

// Generic function to map entities from books
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
            name: categoryValue,
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
