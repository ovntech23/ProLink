const mongoose = require('mongoose');

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
    enum: ['driver', 'owner', 'broker'],
    default: 'owner'
  },
  // Driver-specific fields
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
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
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
