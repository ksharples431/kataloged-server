import { generateBid, findISBN13 } from './utilityHelpers.js';

export const mapBookItem = (item) => ({
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
