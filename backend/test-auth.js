const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { generateToken } = require('./middleware/auth');
require('dotenv').config();

// Test authentication
async function testAuth() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'owner'
    });

    await testUser.save();
    console.log('✅ Created test user:', testUser.email);

    // Test login
    const user = await User.findOne({ email: 'test@example.com' }).select('+password');
    if (user) {
      const isMatch = await bcrypt.compare('password123', user.password);
      if (isMatch) {
        const token = generateToken(user._id);
        console.log('✅ Login successful');
        console.log('✅ Generated token:', token);
        
        // Test token verification
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verification successful:', decoded);
      } else {
        console.log('❌ Password mismatch');
      }
    } else {
      console.log('❌ User not found');
    }

    // Clean up
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Cleaned up test user');

    await mongoose.disconnect();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuth();