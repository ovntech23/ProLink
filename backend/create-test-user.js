const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config({ path: __dirname + '/.env' });

// Create a test user
async function createTestUser() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' }).select('+password');
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      console.log('✅ User ID:', existingUser._id);
      console.log('✅ Password: password123');
      console.log('✅ Role:', existingUser.role);
      return existingUser;
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'owner'
    });

    await testUser.save();
    console.log('✅ Created test user:', testUser.email);
    console.log('✅ User ID:', testUser._id);
    console.log('✅ Password: password123');
    console.log('✅ Role:', testUser.role);

    return testUser;

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

// Test login with the created user
async function testLogin() {
  try {
    const user = await createTestUser();
    
    // Test password verification
    const isMatch = await bcrypt.compare('password123', user.password);
    console.log('✅ Password verification:', isMatch ? 'SUCCESS' : 'FAILED');
    
    if (!isMatch) {
      console.log('❌ Password verification failed - there may be an issue with bcrypt');
      return;
    }

    // Test JWT generation
    const { generateToken } = require('./middleware/auth');
    const token = generateToken(user._id);
    console.log('✅ JWT token generated successfully');
    console.log('✅ Token:', token.substring(0, 50) + '...');

    // Test JWT verification
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT verification:', decoded);

    console.log('\n🎉 Test user setup complete!');
    console.log('📝 Login credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('   Role: owner');

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testLogin();
