const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, getUserById, getCurrentUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const validateInput = require('../middleware/validateInput');

// Validation schemas
const loginSchema = {
  email: {
    isEmail: true,
    notEmpty: true,
    errorMessage: 'Please provide a valid email'
  },
  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long'
    },
    notEmpty: true,
    errorMessage: 'Password is required'
  }
};

const registerSchema = {
  name: {
    isLength: {
      options: { min: 2 },
      errorMessage: 'Name must be at least 2 characters long'
    },
    notEmpty: true,
    errorMessage: 'Name is required'
  },
  email: {
    isEmail: true,
    notEmpty: true,
    errorMessage: 'Please provide a valid email'
  },
  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long'
    },
    notEmpty: true,
    errorMessage: 'Password is required'
  },
  role: {
    isIn: {
      options: [['driver', 'owner', 'broker']],
      errorMessage: 'Role must be driver, owner, or broker'
    },
    notEmpty: true,
    errorMessage: 'Role is required'
  }
};

// Login user
router.post('/login', validateInput(loginSchema), loginUser);

// Register a new user
router.post('/register', validateInput(registerSchema), registerUser);

// Get current user profile
router.get('/me', protect, getCurrentUser);

// Get all users - Protect this route so only authenticated users can see list (or restrict to admin/broker)
router.get('/', protect, getUsers);

// Admin User Management Routes
router.post('/', protect, admin, createUser);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

// Get user by ID
router.get('/:id', getUserById);

module.exports = router;
