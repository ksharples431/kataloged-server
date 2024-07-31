export const mapAuthorsFromUserBooks = async (uid) => {
  const snapshot = await userBookCollection.where('uid', '==', uid).get();
  const authorMap = new Map();

  for (const doc of snapshot.docs) {
    const userBook = doc.data();
    const book = await bookCollection.doc(userBook.bid).get();
    const bookData = book.data();

    if (bookData.author) {
      if (authorMap.has(bookData.author)) {
        authorMap.set(bookData.author, authorMap.get(bookData.author) + 1);
      } else {
        authorMap.set(bookData.author, 1);
      }
    }
  }

  return Array.from(authorMap, ([author, bookCount]) => ({
    author,
    bookCount,
  }));
};


export const mapUserBooksByAuthor = async (uid, author) => {
  const snapshot = await userBookCollection.where('uid', '==', uid).get();
  const authorBooks = [];

  for (const doc of snapshot.docs) {
    const userBook = doc.data();
    const book = await bookCollection.doc(userBook.bid).get();
    const bookData = book.data();

    if (bookData.author === author) {
      authorBooks.push({ ...bookData, ...userBook, ubid: doc.id });
    }
  }

  return authorBooks;
};