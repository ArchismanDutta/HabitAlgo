import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com'
};

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Check if admin token
    if (token.startsWith('admin-token-')) {
      const adminEmail = Buffer.from(token.replace('admin-token-', ''), 'base64').toString();
      if (adminEmail === ADMIN_CREDENTIALS.email) {
        req.user = {
          _id: 'admin-user-id',
          id: 'admin-user-id',
          name: 'Admin',
          email: ADMIN_CREDENTIALS.email,
          isAdmin: true
        };
        return next();
      }
    }

    // Verify regular JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if admin by email
    req.user.isAdmin = req.user.email === ADMIN_CREDENTIALS.email;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};
