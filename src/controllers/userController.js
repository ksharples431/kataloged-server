import db from '../config/firebaseConfig.js';

// Add a new user
export const addUser = async (req, res) => {
  try {
    const { userId, name, email } = req.body;
    await db.collection('users').doc(userId).set({ name, email });
    res.status(201).send('User added successfully');
  } catch (error) {
    res.status(500).send('Error adding user: ' + error.message);
  }
};

// Get a user by ID
export const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      res.status(200).json(userDoc.data());
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error getting user: ' + error.message);
  }
};

// Edit a user by ID
export const editUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email } = req.body;
    await db.collection('users').doc(userId).update({ name, email });
    res.status(200).send('User updated successfully');
  } catch (error) {
    res.status(500).send('Error updating user: ' + error.message);
  }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    await db.collection('users').doc(userId).delete();
    res.status(200).send('User deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting user: ' + error.message);
  }
};
