import  db  from '../config/firebaseConfig.js';

const updateImageUrlsToHttps = async () => {
  const booksSnapshot = await db.collection('books').get();
  const batch = db.batch();

  booksSnapshot.forEach((doc) => {
    const book = doc.data();
    if (book.imagePath && book.imagePath.startsWith('http://')) {
      const updatedImagePath = book.imagePath.replace(
        'http://',
        'https://'
      );
      batch.update(doc.ref, { imagePath: updatedImagePath });
    }
  });

  await batch.commit();
  console.log('All image URLs updated to HTTPS.');
};

updateImageUrlsToHttps().catch(console.error);
