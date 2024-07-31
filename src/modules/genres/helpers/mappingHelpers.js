const bookCollection = db.collection('books');

// Map genres from books
export const mapGenresFromBooks = async () => {
  try {
    const booksSnapshot = await bookCollection.get();
    const categoryMap = new Map();

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
      const genre = book.genre;
      if (genre) {
        if (categoryMap.has(genre)) {
          categoryMap.get(genre).bookCount += 1;
        } else {
          categoryMap.set(genre, {
            genre,
            bookCount: 1,
          });
        }
      }
    });

    return Array.from(categoryMap.values());
  } catch (error) {
    console.error('Error mapping genres from books:', error);
    throw new Error(`Failed to map genres from books: ${error.message}`);
  }
};

// Map books by genre
export const mapGenreBooks = async (genre) => {
  try {
    const booksSnapshot = await bookCollection
      .where('genre', '==', genre)
      .get();

    return booksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error mapping books for genre ${genre}:`, error);
    throw new Error(
      `Failed to map books for genre ${genre}: ${error.message}`
    );
  }
};
