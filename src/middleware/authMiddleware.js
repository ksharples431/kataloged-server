import { admin } from '../config/firebaseConfig.js';

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ error: 'No authorization header provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (!idToken) {
    return res
      .status(401)
      .json({ error: 'Invalid authorization header format' });
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    console.log('Token verified for user:', decodedIdToken.uid);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default verifyToken;
