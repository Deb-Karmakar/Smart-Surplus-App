const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the 'x-auth-token' header
  const token = req.header('x-auth-token');

  // Check if no token is present
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify the token
  try {
    // Decode the token using your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the user payload (which contains the user's ID) to the request object
    req.user = decoded.user;
    
    // Pass control to the next function in the middleware chain (the controller)
    next();
  } catch (err) {
    // If the token is not valid for any reason
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
