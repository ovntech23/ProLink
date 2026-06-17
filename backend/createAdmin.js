const mongoose = require('./config/db-compat');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      console.log('   Updating password...');
      existingAdmin.password = 'Admin@123456';
      await existingAdmin.save();
      console.log('✅ Admin password updated to: Admin@123456');
      process.exit(0);
    }

    // Admin user details - CHANGE THESE VALUES
    const adminData = {
      name: 'ProLink Admin',
      email: 'admin@prolinkafrica.com',
      password: 'Admin@123456', // This will be hashed
      role: 'admin',
      phone: '+260-XXX-XXXXXX',
      isApproved: true, // Admin is automatically approved
    };

    console.log('\n📝 Creating admin user with the following details:');
    console.log('   Name:', adminData.name);
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password, '(will be hashed)');
    console.log('   Role:', adminData.role);
    console.log('   Phone:', adminData.phone);



    // Create admin user
    const admin = new User({
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      role: adminData.role,
      phone: adminData.phone,
      isApproved: adminData.isApproved,
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('\n🔐 Login credentials:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
    console.log('⚠️  Store these credentials securely and delete this script output.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
