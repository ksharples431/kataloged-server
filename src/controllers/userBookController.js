import HttpError from '../models/httpErrorModel.js';
import { addUserBookSchema } from '../models/userBookModel.js';
import {
  validateSortOptions,
  fetchUserBooks,
  createUserBookHelper,
  fetchCombinedUserBookData,
  fetchUserBookById,
} from './utils/userBookHelpers.js';

// Create User Book
export const createUserBook = async (req, res, next) => {
  try {
    validateUserBookInput(req.body, addUserBookSchema);
    const userBook = await createUserBookHelper(req.body);
    res.status(201).json({
      message: 'User book created successfully',
      userBook,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Books with sorting
export const getUserBooks = async (req, res, next) => {
  try {
    const { uid, sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    if (!uid) {
      throw new HttpError('User ID is required', 400);
    }

    const userBooks = await fetchUserBooks(uid, sortBy, order);

    if (userBooks.length === 0) {
      return res.status(200).json({
        message: "No books in user's library",
        userBooks: [],
      });
    }

    res.status(200).json({
      message: 'User books retrieved successfully',
      userBooks: userBooks,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Book by Id
export const getUserBookById = async (req, res, next) => {
  try {
    const { ubid } = req.params;
    console.log(ubid);

    const userBook = await fetchUserBookById(ubid);
    const combinedData = await fetchCombinedUserBookData(userBook);

    res.status(200).json({
      message: 'User book retrieved successfully',
      userBook: combinedData,
    });
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
