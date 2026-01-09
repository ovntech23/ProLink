const mongoose = require('mongoose');
const Statistic = require('./models/Statistic');
const Cargo = require('./models/Cargo');
const Feature = require('./models/Feature');
const dotenv = require('dotenv');

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
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Test creating new data
const testCreateData = async () => {
  try {
    await connectDB();

    console.log('\n=== TESTING DATA CREATION ===\n');

    // Test creating a new statistic
    console.log('1. Creating a new statistic...');
    const newStatistic = new Statistic({
      label: 'Test Statistic',
      value: '100%',
      description: 'This is a test statistic',
      category: 'company',
      order: 5
    });
    
    const savedStatistic = await newStatistic.save();
    console.log('   Created statistic:', savedStatistic.label, '-', savedStatistic.value);

    // Test creating a new cargo
    console.log('\n2. Creating a new cargo...');
    const newCargo = new Cargo({
      name: 'Test Cargo',
      description: 'This is a test cargo item',
      category: 'Test Category',
      isActive: true,
      order: 13
    });
    
    const savedCargo = await newCargo.save();
    console.log('   Created cargo:', savedCargo.name, 'in category', savedCargo.category);

    // Test creating a new feature
    console.log('\n3. Creating a new feature...');
    const newFeature = new Feature({
      title: 'Test Feature',
      description: 'This is a test feature for verification purposes',
      icon: 'TestIcon',
      category: 'core-value',
      isActive: true,
      order: 4
    });
    
    const savedFeature = await newFeature.save();
    console.log('   Created feature:', savedFeature.title);

    console.log('\n=== CREATION TEST COMPLETE ===\n');
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await Statistic.findByIdAndDelete(savedStatistic._id);
    await Cargo.findByIdAndDelete(savedCargo._id);
    await Feature.findByIdAndDelete(savedFeature._id);
    console.log('Test data cleaned up.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing data creation:', error);
    process.exit(1);
  }
};

// Run the test
testCreateData();