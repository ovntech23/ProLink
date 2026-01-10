const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, getUserById } = require('../controllers/userController');
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

// Get all users
router.get('/', getUsers);

// Get user by ID
router.get('/:id', getUserById);

module.exports = router;
