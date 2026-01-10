const mongoose = require('mongoose');
const Statistic = require('./models/Statistic');
const Cargo = require('./models/Cargo');
const Feature = require('./models/Feature');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample statistics data (from StatsSection)
const statisticsData = [
  {
    label: 'Inception',
    value: 'Est. 2023',
    description: 'Company founded',
    category: 'company',
    order: 1
  },
  {
    label: 'Zambian Owned',
    value: '100%',
    description: 'Local ownership',
    category: 'company',
    order: 2
  },
  {
    label: 'Continental Routes',
    value: '8+',
    description: 'Routes across Africa',
    category: 'service',
    order: 3
  },
  {
    label: 'Partner Carriers',
    value: '15+',
    description: 'Trusted partners',
    category: 'achievement',
    order: 4
  }
];

// Sample cargo data (from CargoListSection)
const cargosData = [
  { name: 'Wheat', category: 'Agricultural', order: 1 },
  { name: 'Soya Beans', category: 'Agricultural', order: 2 },
  { name: 'Maize', category: 'Agricultural', order: 3 },
  { name: 'Seed', category: 'Agricultural', order: 4 },
  { name: 'Fertilizer', category: 'Agricultural', order: 5 },
  { name: 'Limestone', category: 'Industrial', order: 6 },
  { name: 'Coal', category: 'Industrial', order: 7 },
  { name: 'Cement', category: 'Construction', order: 8 },
  { name: 'Steel', category: 'Construction', order: 9 },
  { name: 'Timber', category: 'Construction', order: 10 },
  { name: 'Tiles', category: 'Construction', order: 11 },
  { name: 'Groceries', category: 'Consumer Goods', order: 12 }
];

// Sample features data (from FeaturesSection)
const featuresData = [
  {
    title: 'Integrity',
    description: 'We operate with absolute transparency and honesty, ensuring every transaction is authentic and accountable.',
    icon: 'Shield',
    category: 'core-value',
    order: 1
  },
  {
    title: 'Excellence',
    description: 'Delivering customized solutions that exceed expectations, with a focus on real customer service and efficiency.',
    icon: 'Globe',
    category: 'core-value',
    order: 2
  },
  {
    title: 'Innovation',
    description: 'Zambia\'s fast-growing logistics backbone, constantly evolving to solve modern trade challenges.',
    icon: 'Zap',
    category: 'core-value',
    order: 3
  }
];

// Seed the database
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Statistic.deleteMany();
    await Cargo.deleteMany();
    await Feature.deleteMany();
    await User.deleteMany(); // Clear users collection

    console.log('Existing data cleared');

    // Insert new data
    await Statistic.insertMany(statisticsData);
    console.log('Statistics data inserted');

    await Cargo.insertMany(cargosData);
    console.log('Cargo data inserted');

    await Feature.insertMany(featuresData);
    console.log('Features data inserted');

    // Create admin user
    await seedAdminUser();

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Create a system admin user with default credentials
const seedAdminUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10); // Default password

    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@prolink.com',
      password: hashedPassword,
      role: 'admin',
      isApproved: true
    });

    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      await adminUser.save();
      console.log('System admin user created successfully.');
    } else {
      console.log('System admin user already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Run the seed function
seedDatabase();