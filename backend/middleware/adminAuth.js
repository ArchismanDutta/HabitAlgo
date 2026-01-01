const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'archieadmin19102001'
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin && req.user?.email !== ADMIN_CREDENTIALS.email) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
  next();
};
