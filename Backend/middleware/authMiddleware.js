const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  console.log('Auth middleware called, token exists:', !!token); // Debug log

  // Check if not token
  if (!token) {
    console.log('Access denied - no token provided'); // Debug log
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully, user ID:', decoded.user?.id); // Debug log
    
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message); // Debug log
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
