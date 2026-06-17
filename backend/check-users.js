const mongoose = require('./config/db-compat');

const uris = [
  { name: 'ENV URI', uri: 'mongodb://root:mETBvZRRfkvGdBoHyW1isfuRb9NmrK0VHt6edSLPmadB68LZ5xpfPR8SPdRkRoao@k48ok4k8kswgk4ow88kkso8w:27017/prolink?directConnection=true' },
  { name: 'Atlas URI', uri: 'mongodb+srv://ovinenyalazi_db_user:iLWMpUZib2Ll4qYx@prolink.98tyycg.mongodb.net/prolink?retryWrites=true&w=majority' },
  { name: 'Local URI', uri: 'mongodb://admin:password@localhost:27017/prolink?authSource=admin' }
];

async function testUri(name, uri) {
  console.log(`\nTesting connection to ${name}...`);
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ Connected to ${name}`);
    
    // Define User schema if not registered
    let User;
    try {
      User = mongoose.model('User');
    } catch {
      const userSchema = new mongoose.Schema({
        name: String,
        email: String,
        role: String
      }, { collection: 'users' });
      User = mongoose.model('User', userSchema);
    }
    
    const admins = await User.find({ role: 'admin' });
    console.log(`Found ${admins.length} admins:`);
    admins.forEach(admin => {
      console.log(`- Name: ${admin.name}, Email: ${admin.email}`);
    });
    
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    if (allUsers.length > 0) {
      console.log('Sample users:');
      allUsers.slice(0, 5).forEach(u => console.log(`  - ${u.name} (${u.email}) - ${u.role}`));
    }
    
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error(`❌ Failed to connect to ${name}:`, err.message);
    return false;
  }
}

async function run() {
  for (const item of uris) {
    const success = await testUri(item.name, item.uri);
    if (success) {
      console.log(`🎉 Successful connection made to ${item.name}`);
      break;
    }
  }
  process.exit(0);
}

run();
