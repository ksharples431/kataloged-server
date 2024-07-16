import db, { admin } from '../config/firebaseConfig.js';
import HttpError, { DatabaseError } from '../models/httpErrorModel.js';
import {
  fetchUserById
} from './utils/userHelpers.js';

export const getUserById = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const user = await fetchUserById(uid);

    res.status(200).json({
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// export const updateUser = async (req, res, next) => {
//   try {
//     validateInput(req.body, updateUserSchema);

//     const { uid } = req.params;
//     const doc = await getDocumentById(userCollection, uid, 'User');

//     const currentData = doc.data();
//     const updateData = { ...req.body };

//     delete updateData.id;
//     delete updateData.createdAt;

//     const hasChanges = Object.entries(updateData).some(
//       ([key, value]) => currentData[key] !== value
//     );

//     if (!hasChanges) {
//       const user = formatResponseData(doc);
//       return res
//         .status(200)
//         .json(formatSuccessResponse('No changes detected', { user }));
//     }

//     updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
//     await doc.ref.update(updateData);

//     const updatedDoc = await doc.ref.get();

//     const user = formatResponseData(updatedDoc);
//     res
//       .status(200)
//       .json(formatSuccessResponse('User updated successfully', { user }));
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteUser = async (req, res, next) => {
//   try {
//     const { uid } = req.params;
//     const doc = await getDocumentById(userCollection, uid, 'User');

//     await doc.ref.delete();
//     res
//       .status(200)
//       .json(formatSuccessResponse('User deleted successfully', null));
//   } catch (error) {
//     next(error);
//   }
// };
