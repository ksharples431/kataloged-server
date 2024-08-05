export const formatUserBookCoverResponse = (book) => {
  return {
    author: book.author,
    ubid: book.ubid,
    imagePath: book.imagePath,
    title: book.title,
  };
};

export const formatUserBookDetailsResponse = (book) => {
  return {
    author: book.author,
    ubid: book.ubid,
    description: book.description,
    genre: book.genre,
    imagePath: book.imagePath,
    isbn: book.isbn,
    seriesName: book.seriesName,
    seriesNumber: book.seriesNumber,
    title: book.title,
  };
};

export const generateLowercaseFields = (book) => {
  return {
    ...book,
    lowercaseTitle: book.title ? book.title.toLowerCase() : '',
    lowercaseAuthor: book.author ? book.author.toLowerCase() : '',
  };
};
