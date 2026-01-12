const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// User model (simplified for migration)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  status: String,
  phone: String,
  isApproved: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function cleanupUserStatus() {
  try {
    console.log('🔄 Starting user status cleanup...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with status field
    const usersWithStatus = await User.find({ status: { $exists: true } });
    console.log(`📊 Found ${usersWithStatus.length} users with status field`);

    let updatedCount = 0;

    for (const user of usersWithStatus) {
      // Remove status field for non-driver users
      if (user.role !== 'driver') {
        await User.updateOne(
          { _id: user._id },
          { $unset: { status: 1 } }
        );
        updatedCount++;
        console.log(`🧹 Removed status from ${user.email} (${user.role})`);
      } else {
        // For drivers, ensure they have a valid status
        if (!['available', 'busy', 'offline'].includes(user.status)) {
          await User.updateOne(
            { _id: user._id },
            { status: 'available' }
          );
          updatedCount++;
          console.log(`🔧 Fixed invalid status for driver ${user.email}`);
        }
      }
    }

    console.log(`✅ Cleanup complete! Updated ${updatedCount} users`);

    // Show final status distribution
    const driverStats = await User.aggregate([
      { $match: { role: 'driver' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log('📈 Driver status distribution:');
    driverStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    const nonDriverWithStatus = await User.countDocuments({
      role: { $ne: 'driver' },
      status: { $exists: true }
    });

    console.log(`📊 Non-drivers with status field: ${nonDriverWithStatus}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupUserStatus();