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

// Verify data in collections
const verifyData = async () => {
  try {
    await connectDB();

    console.log('\n=== VERIFYING DATABASE CONTENT ===\n');

    // Check statistics
    console.log('1. STATISTICS COLLECTION:');
    const statistics = await Statistic.find({});
    console.log(`   Found ${statistics.length} statistics`);
    statistics.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.label}: ${stat.value} (${stat.description})`);
    });

    console.log('\n2. CARGO COLLECTION:');
    const cargos = await Cargo.find({});
    console.log(`   Found ${cargos.length} cargo items`);
    cargos.forEach((cargo, index) => {
      console.log(`   ${index + 1}. ${cargo.name} (${cargo.category})`);
    });

    console.log('\n3. FEATURES COLLECTION:');
    const features = await Feature.find({});
    console.log(`   Found ${features.length} features`);
    features.forEach((feature, index) => {
      console.log(`   ${index + 1}. ${feature.title}: ${feature.description.substring(0, 50)}...`);
    });

    console.log('\n=== VERIFICATION COMPLETE ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Error verifying data:', error);
    process.exit(1);
  }
};

// Run the verification
verifyData();