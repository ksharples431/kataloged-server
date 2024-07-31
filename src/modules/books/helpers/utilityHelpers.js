import hashSum from 'hash-sum';

export const formatBookCoverResponse = (book) => {
  return {
    bid: book.bid,
    title: book.title,
    author: book.author,
    imagePath: book.imagePath,
  };
};

export const formatBookDetailsResponse = (book) => {
  return {
    author: book.author,
    title: book.title,
    description: book.description,
    genre: book.genre,
    imagePath: book.imagePath,
    isbn: book.isbn,
    seriesName: book.seriesName,
    seriesNumber: book.seriesNumber,
  };
};

export const generateLowercaseFields = (book) => {
  return {
    ...book,
    lowercaseTitle: book.title ? book.title.toLowerCase() : '',
    lowercaseAuthor: book.author ? book.author.toLowerCase() : '',
  };
};

export const generateBid = (item) => {
  const uniqueString = `${item.id}-${item.etag}-${Date.now()}`;
  return hashSum(uniqueString).substring(0, 28);
};

export const findISBN13 = (industryIdentifiers) => {
  if (!industryIdentifiers) return 'N/A';
  const isbn13 = industryIdentifiers.find((id) => id.type === 'ISBN_13');
  return isbn13 ? isbn13.identifier : 'N/A';
};

