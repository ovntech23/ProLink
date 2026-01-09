const express = require('express');
const router = express.Router();
const { registerUser, getUsers, getUserById } = require('../controllers/userController');

// Register a new user
router.post('/register', registerUser);

// Get all users
router.get('/', getUsers);

// Get user by ID
router.get('/:id', getUserById);

module.exports = router;