const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agentic-site', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({}, 'name email username password');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name}: ${user.email} (${user.username})`);
      console.log(`  Password hash: ${user.password.substring(0, 20)}...`);
    });

    // Test login for Sanskruti
    const sanskruti = await User.findOne({ email: 'sanskruti@example.com' });
    if (sanskruti) {
      console.log('\nTesting Sanskruti login...');
      const isMatch = await sanskruti.comparePassword('Om101105');
      console.log(`Password match: ${isMatch}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

checkUsers();