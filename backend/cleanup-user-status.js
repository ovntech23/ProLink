const mongoose = require('./config/db-compat');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function cleanupUserStatus() {
  try {
    console.log('🔄 Starting user status cleanup...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Database');

    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);

    let updatedCount = 0;

    for (const user of users) {
      // Set status to null for non-driver users
      if (user.role !== 'driver') {
        if (user.status !== null) {
          user.status = null;
          await user.save();
          updatedCount++;
          console.log(`🧹 Removed status from ${user.email} (${user.role})`);
        }
      } else {
        // For drivers, ensure they have a valid status
        if (!['available', 'busy', 'offline'].includes(user.status)) {
          user.status = 'available';
          await user.save();
          updatedCount++;
          console.log(`🔧 Fixed invalid status for driver ${user.email}`);
        }
      }
    }

    console.log(`✅ Cleanup complete! Updated ${updatedCount} users`);

    // Show final status distribution
    const { sequelize } = mongoose;
    const driverStats = await sequelize.models.User.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('_id')), 'count']],
      where: { role: 'driver' },
      group: ['status'],
      raw: true
    });

    console.log('📈 Driver status distribution:');
    driverStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count}`);
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from Database');
  }
}

// Run the cleanup
cleanupUserStatus();