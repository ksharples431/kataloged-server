export const mapGenresFromUserBooks = async (uid) => {
  const snapshot = await userBookCollection.where('uid', '==', uid).get();
  const genreMap = new Map();

  for (const doc of snapshot.docs) {
    const userBook = doc.data();
    const book = await bookCollection.doc(userBook.bid).get();
    const bookData = book.data();

    if (bookData.genre) {
      if (genreMap.has(bookData.genre)) {
        genreMap.set(bookData.genre, genreMap.get(bookData.genre) + 1);
      } else {
        genreMap.set(bookData.genre, 1);
      }
    }
  }

  return Array.from(genreMap, ([genre, bookCount]) => ({
    genre,
    bookCount,
  }));
};


export const mapUserBooksByGenre = async (uid, genre) => {
  const snapshot = await userBookCollection.where('uid', '==', uid).get();
  const genreBooks = [];

  for (const doc of snapshot.docs) {
    const userBook = doc.data();
    const book = await bookCollection.doc(userBook.bid).get();
    const bookData = book.data();

    if (bookData.genre === genre) {
      genreBooks.push({ ...bookData, ...userBook, ubid: doc.id });
    }
  }

  return genreBooks;
};