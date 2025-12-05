const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const testUsers = [
  {
    name: "Sanskruti",
    email: "sanskruti@example.com",
    username: "sankii30",
    number: "1234567890",
    password: "Om101105", // Plain text password - will be hashed by model
    isVerified: true,
    role: "user"
  },
  {
    name: "Test User",
    email: "test@example.com",
    username: "testuser",
    number: "0987654321",
    password: "test123", // Plain text password - will be hashed by model
    isVerified: true,
    role: "user"
  },
  {
    name: "Rahul",
    email: "rahul@example.com",
    username: "rahul",
    number: "1111111111",
    password: "rahul123", // Plain text password - will be hashed by model
    isVerified: true,
    role: "user"
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agentic-site', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing test users first
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    console.log('Cleared existing test users');

    // Create new users with plain text passwords
    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.name} with plain password: ${userData.password}`);

      // Create user directly with plain password - model will hash it
      const user = new User({
        name: userData.name,
        email: userData.email,
        username: userData.username,
        number: userData.number,
        password: userData.password // Plain text - model pre-save hook will hash
      });

      await user.save();
      console.log(`✓ Created user: ${userData.name} (${userData.email})`);
    }

    console.log('\nUser seeding completed successfully!');
    console.log('Test login credentials:');
    console.log('- Email: sanskruti@example.com, Password: Om101105');
    console.log('- Email: test@example.com, Password: test123');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedUsers();