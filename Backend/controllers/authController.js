const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Create a new user instance
    user = new User({
      name,
      email,
      password,
      role,
    });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();
    console.log('New user registered:', user.email, 'with role:', user.role); // Debug log

    // Create a JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the token and send it back
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Authenticate a user and get token
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  try {
    // Check for user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login attempt failed - user not found:', email); // Debug log
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login attempt failed - wrong password for:', email); // Debug log
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('User logged in successfully:', user.email, 'Role:', user.role, 'ID:', user._id); // Debug log

    // Create JWT payload
    const payload = {
      user: {
        id: user.id, // This should be user._id converted to string
      },
    };

    // Sign the token and send it back
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        console.log('JWT token created for user ID:', user.id); // Debug log
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get the logged-in user's data
exports.getLoggedInUser = async (req, res) => {
  try {
    console.log('getLoggedInUser called for user ID:', req.user?.id); // Debug log
    
    // req.user.id is available from the authMiddleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('User not found in database for ID:', req.user.id); // Debug log
      return res.status(404).json({ msg: 'User not found' });
    }
    
    console.log('Returning user data:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }); // Debug log
    
    res.json(user);
  } catch (err) {
    console.error('Error in getLoggedInUser:', err.message);
    res.status(500).send('Server Error');
  }
};