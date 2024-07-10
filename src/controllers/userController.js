import db, { admin } from '../config/firebaseConfig.js';
import HttpError, { DatabaseError } from '../models/httpErrorModel.js';
import {
  formatResponseData,
  formatSuccessResponse,
  getDocumentById,
  validateInput,
  getCurrentUserUID,
  convertFirestoreTimestamp,
} from './utils/helperFunctions.js';
import {
  createUserSchema,
  googleSignInSchema,
  updateUserSchema,
  loginUserSchema,
} from '../models/userModel.js';

const userCollection = db.collection('users');

export const googleSignIn = async (req, res, next) => {
  try {
    validateInput(req.body, googleSignInSchema);
    console.log(req.body)
     if (
       !req.headers.authorization ||
       !req.headers.authorization.startsWith('Bearer ')
     ) {
       throw new HttpError(
         'Missing or invalid authorization token'
       );
     }

    const { email } = req.body;
    const idToken = req.headers.authorization.split('Bearer ')[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    let user = await userCollection.doc(uid).get();
    let isNewUser = false;

    if (!user.exists) {
      isNewUser = true;
      const newUser = {
        username: decodedToken.name || email.split('@')[0],
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await userCollection.doc(uid).set(newUser);
      user = await userCollection.doc(uid).get();

      if (!user.exists) {
        throw new DatabaseError('googleSignIn');
      }
    } else {
      await userCollection.doc(uid).update({
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    const formattedUser = {
      uid: user.id,
      ...user.data(),
      updatedAt: convertFirestoreTimestamp(user.data().updatedAt),
    };

    res
      .status(200)
      .json(
        formatSuccessResponse(
          isNewUser
            ? 'User created successfully'
            : 'User signed in successfully',
          { user: formattedUser }
        )
      );
  } catch (error) {
    next(error);
  }
};

export const signupUser = async (req, res, next) => {
  try {
    validateInput(req.body, createUserSchema);

    const { username, email } = req.body;
    const idToken = req.headers.authorization.split('Bearer ')[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const existingUser = await userCollection.doc(uid).get();
    if (existingUser.exists) {
      throw new HttpError('User with this UID already exists', 409);
    }

    const newUser = {
      username,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userCollection.doc(uid).set(newUser);

    const createdUser = await userCollection.doc(uid).get();

    if (!createdUser.exists) {
      throw new DatabaseError('createUser');
    }

    const user = formatResponseData(createdUser);

    res
      .status(201)
      .json(formatSuccessResponse('User created successfully', { user }));
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    validateInput(req.body, loginUserSchema);

    const idToken = req.headers.authorization.split('Bearer ')[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await userCollection.doc(uid).get();

    if (!userDoc.exists) {
      throw new DatabaseError('login');
    }

    const formattedUser = formatResponseData(userDoc);

    const customToken = await admin.auth().createCustomToken(uid);

    res.status(200).json(
      formatSuccessResponse('User logged in successfully', {
        user: formattedUser,
        token: customToken,
      })
    );
  } catch (error) {
    if (
      error.code === 'auth/argument-error' || 
      error.message.includes('The Firebase ID token is invalid or expired') 
    ) {
      next(new HttpError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

// export const getUser = async (req, res, next) => {
//   try {
//     const { uid } = req.params;
//     const doc = await getDocumentById(userCollection, uid, 'User');

//     const user = formatResponseData(doc);
//     res
//       .status(200)
//       .json(formatSuccessResponse('User successfully fetched', { user }));
//   } catch (error) {
//     next(error);
//   }
// };

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
