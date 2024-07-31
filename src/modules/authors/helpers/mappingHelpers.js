const bookCollection = db.collection('books');

// Map authors from books
export const mapAuthorsFromBooks = async () => {
  try {
    const booksSnapshot = await bookCollection.get();
    const categoryMap = new Map();

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
      const author = book.author;
      if (author) {
        if (categoryMap.has(author)) {
          categoryMap.get(author).bookCount += 1;
        } else {
          categoryMap.set(author, {
            author,
            bookCount: 1,
          });
        }
      }
    });

    return Array.from(categoryMap.values());
  } catch (error) {
    console.error('Error mapping authors from books:', error);
    throw new Error(`Failed to map authors from books: ${error.message}`);
  }
};

// Map books by author
export const mapAuthorBooks = async (author) => {
  try {
    const booksSnapshot = await bookCollection
      .where('author', '==', author)
      .get();

    return booksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error mapping books for author ${author}:`, error);
    throw new Error(
      `Failed to map books for author ${author}: ${error.message}`
    );
  }
};
