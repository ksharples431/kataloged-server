import db, { auth } from '../config/firebaseConfig.js';
import firebase from 'firebase-admin';
import { sortBooks } from './utils/bookSorting.js';
import HttpError, {
  ValidationError,
  DatabaseError,
  NotFoundError,
} from '../models/httpErrorModel.js';
import {
  formatResponseData,
  formatSuccessResponse,
  getDocumentById,
  validateInput,
  validateSortOptions,
  getCurrentUserUID,
  convertFirestoreTimestamp,
} from './utils/helperFunctions.js';
import {
  fetchCombinedBookData,
  fetchCombinedBooksData,
} from './utils/combineBookData.js';
import {
  addUserBookSchema,
  updateUserBookSchema,
} from '../models/userBookModel.js';

const userBookCollection = db.collection('userBooks');

// Create User Book
export const createUserBook = async (req, res, next) => {
  try {
    validateInput(req.body, addUserBookSchema);

    const { uid, bid, ...otherFields } = req.body;

    const existingBook = await userBookCollection
      .where('uid', '==', uid)
      .where('bid', '==', bid)
      .get();

    if (!existingBook.empty) {
      return res.status(409).json({
        success: false,
        message: "This book already exists in the user's library",
      });
    }

    const newUserBook = {
      uid,
      bid,
      ...otherFields,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await userBookCollection.add(newUserBook);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new DatabaseError('addUserBook');
    }
    const userBook = {
      ...doc.data(),
      ubid: doc.id,
      updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
    };

    console.log(userBook);
    res.status(201).json(
      formatSuccessResponse('Book added to user library successfully', {
        userBook,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Get User Books with sorting
export const getUserBooks = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    const snapshot = await userBookCollection
      .where('uid', '==', uid)
      .get();

    if (snapshot.empty) {
      return res.status(200).json(
        formatSuccessResponse('No books found for this user', {
          userBooks: [],
        })
      );
    }

    let userBooksWithFullInfo = await fetchCombinedBooksData(
      snapshot.docs
    );

    userBooksWithFullInfo = sortBooks(
      userBooksWithFullInfo,
      sortBy,
      order
    );

    res.status(200).json(
      formatSuccessResponse('User Books retrieved successfully', {
        userBooks: userBooksWithFullInfo,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Get User Book by Id
export const getUserBookById = async (req, res, next) => {
  try {
    const { ubid } = req.params;
    const userBookDoc = await getDocumentById(
      userBookCollection,
      ubid,
      'User Book'
    );

    const combinedData = await fetchCombinedBookData(userBookDoc);

    if (!combinedData) {
      throw new NotFoundError(`Associated book`);
    }

    res.status(200).json(
      formatSuccessResponse('User Book retrieved successfully', {
        userBook: combinedData,
      })
    );
  } catch (error) {
    next(error);
  }
};

// export const updateUserBook = async (req, res, next) => {
//   try {
//     validateInput(req.body, updateUserBookSchema);

//     const { id } = req.params;
//     const doc = await getDocumentById(userBookCollection, id, 'User Book');

//     const currentData = doc.data();
//     const updateData = { ...req.body };

//     delete updateData.id;
//     delete updateData.createdAt;

//     const hasChanges = Object.entries(updateData).some(
//       ([key, value]) => currentData[key] !== value
//     );

//     if (!hasChanges) {
//       const userBook = formatResponseData(doc);
//       return res
//         .status(200)
//         .json(formatSuccessResponse('No changes detected', { userBook }));
//     }

//     updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
//     await doc.ref.update(updateData);

//     const updatedDoc = await doc.ref.get();
//     const userBook = formatResponseData(updatedDoc);

//     res.status(200).json(
//       formatSuccessResponse('User book updated successfully', {
//         userBook,
//       })
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// Delete User Book
// export const deleteUserBook = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const doc = await getDocumentById(userBookCollection, id, 'User Book');

//     await doc.ref.delete();
//     res
//       .status(200)
//       .json(
//         formatSuccessResponse(
//           'Book removed from user library successfully',
//           null
//         )
//       );
//   } catch (error) {
//     next(error);
//   }
// };
