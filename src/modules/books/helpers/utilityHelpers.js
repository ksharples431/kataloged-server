import hashSum from 'hash-sum';

export const formatBookCoverResponse = (book) => {
  return {
    author: book.author,
    bid: book.bid,
    imagePath: book.imagePath,
    title: book.title,
  };
};

export const formatBookDetailsResponse = (book) => {
  return {
    author: book.author,
    bid: book.bid,
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

export const generateBid = (item) => {
  const uniqueString = `${item.id}-${item.etag}-${Date.now()}`;
  return hashSum(uniqueString).substring(0, 28);
};

export const findISBN13 = (industryIdentifiers) => {
  if (!industryIdentifiers) return 'N/A';
  const isbn13 = industryIdentifiers.find((id) => id.type === 'ISBN_13');
  return isbn13 ? isbn13.identifier : 'N/A';
};

