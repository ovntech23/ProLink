const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// Import io instance for WebSocket events
// Import io instance for WebSocket events - Removed circular dependency
// io is now retrieved from req.app.get('io') in controllers

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'User registered successfully'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-vehicleImage');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create user (Admin)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Role validation
    if (!['driver', 'owner', 'broker', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Hash password not needed here because User model pre-save hook handles it
    // But we need to make sure we pass the plain password to the model

    const userData = {
      name,
      email,
      password, // Pre-save hook will hash this
      role,
      phone,
      isApproved: true // Admin created users are auto-approved
    };

    // Set default status for drivers
    if (role === 'driver') {
      userData.status = 'available';
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'User created successfully'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.phone = req.body.phone || user.phone;

      if (req.body.isApproved !== undefined) {
        user.isApproved = req.body.isApproved;
      }

      if (req.body.password) {
        user.password = req.body.password; // Pre-save hook will hash this
      }

      const updatedUser = await user.save();

      // Emit WebSocket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.emit('userUpdate', {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isApproved: updatedUser.isApproved,
          phone: updatedUser.phone,
          updatedAt: updatedUser.updatedAt
        });
      }

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
        message: 'User updated successfully'
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Use deleteOne instead of remove (deprecated)
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Login user & get token
// @route POST /api/users/login
// @access Public
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;

      if (user.role === 'driver') {
        user.status = req.body.status || user.status;
        user.vehicleType = req.body.vehicleType || user.vehicleType;
        user.vehiclePlate = req.body.vehiclePlate || user.vehiclePlate;
        user.vehicleModel = req.body.vehicleModel || user.vehicleModel;
        user.vehicleCategory = req.body.vehicleCategory || user.vehicleCategory;
        user.trailerPlate = req.body.trailerPlate || user.trailerPlate;
        user.currentLocation = req.body.currentLocation || user.currentLocation;
        user.vehicleImage = req.body.vehicleImage || user.vehicleImage;
      }

      const updatedUser = await user.save();

      // Emit WebSocket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.emit('userUpdate', {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          phone: updatedUser.phone
        });

        if (updatedUser.role === 'driver') {
          io.emit('driverUpdate', {
            id: updatedUser._id,
            status: updatedUser.status,
            currentLocation: updatedUser.currentLocation,
            avatar: updatedUser.avatar,
            vehicleImage: updatedUser.vehicleImage
          });
        }
      }

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        status: updatedUser.status,
        vehicleType: updatedUser.vehicleType,
        vehiclePlate: updatedUser.vehiclePlate,
        vehicleModel: updatedUser.vehicleModel,
        vehicleCategory: updatedUser.vehicleCategory,
        trailerPlate: updatedUser.trailerPlate,
        currentLocation: updatedUser.currentLocation,
        vehicleImage: updatedUser.vehicleImage
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change user password
// @route   PUT /api/users/profile/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Login attempt:', { email, passwordLength: password.length });

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    console.log('🔍 User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('🔍 User details:', {
      id: user._id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔍 Password match:', isMatch);

    if (user && isMatch) {
      // Generate token
      const token = generateToken(user._id);
      console.log('✅ Login successful for user:', user.email);

      // Return user data with all fields
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        token
      };

      // Include driver-specific fields if role is driver
      if (user.role === 'driver') {
        userData.status = user.status;
        userData.vehicleType = user.vehicleType;
        userData.vehiclePlate = user.vehiclePlate;
        userData.vehicleImage = user.vehicleImage;
        userData.trailerPlate = user.trailerPlate;
        userData.vehicleCategory = user.vehicleCategory;
        userData.vehicleModel = user.vehicleModel;
        userData.currentLocation = user.currentLocation;
      }

      res.json(userData);
    } else {
      console.log('❌ Invalid credentials for user:', user.email);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUserProfile,
  changePassword,
  updateUser,
  deleteUser
};
