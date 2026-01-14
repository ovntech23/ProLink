const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['driver', 'owner', 'broker', 'admin'],
    default: 'owner'
  },
  // Driver-specific fields (only applicable to driver role)
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  vehicleType: {
    type: String
  },
  vehiclePlate: {
    type: String
  },
  vehicleModel: {
    type: String
  },
  vehicleCategory: {
    type: String
  },
  trailerPlate: {
    type: String
  },
  currentLocation: {
    type: String
  },
  phone: {
    type: String
  },
  avatar: {
    type: String
  },
  vehicleImage: {
    type: String
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // Hash the password with a salt round of 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
