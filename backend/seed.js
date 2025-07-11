const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected for seeding'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@mic.edu',
    password: 'admin123',
    role: 'admin',
    department: 'Human Resources',
    address: '123 Admin Street, City, State 12345',
    mobileNo: '9876543210',
    bloodGroup: 'A+',
    dateOfBirth: '1985-01-15',
    dateOfJoining: '2020-01-01'
  },
  {
    name: 'HOD Computer Science',
    email: 'hod@mic.edu',
    password: 'hod123',
    role: 'hod',
    department: 'Computer Science',
    address: '456 HOD Avenue, City, State 12345',
    mobileNo: '9876543211',
    bloodGroup: 'B+',
    dateOfBirth: '1980-03-20',
    dateOfJoining: '2018-06-01'
  },
  {
    name: 'John Employee',
    email: 'employee@mic.edu',
    password: 'employee123',
    role: 'employee',
    department: 'Computer Science',
    address: '789 Employee Road, City, State 12345',
    mobileNo: '9876543212',
    bloodGroup: 'O+',
    dateOfBirth: '1990-07-10',
    dateOfJoining: '2021-03-15'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@mic.edu',
    password: 'employee123',
    role: 'employee',
    department: 'Information Technology',
    address: '321 IT Street, City, State 12345',
    mobileNo: '9876543213',
    bloodGroup: 'AB+',
    dateOfBirth: '1992-11-25',
    dateOfJoining: '2022-01-10'
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@mic.edu',
    password: 'employee123',
    role: 'employee',
    department: 'Electronics',
    address: '654 Electronics Lane, City, State 12345',
    mobileNo: '9876543214',
    bloodGroup: 'A-',
    dateOfBirth: '1988-05-12',
    dateOfJoining: '2019-08-20'
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Generate unique employeeIds for each user
    const year = new Date().getFullYear();
    for (let i = 0; i < users.length; i++) {
      users[i].employeeId = `MIC${year}${String(i + 1).padStart(4, '0')}`;
    }

    // Create new users
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Display created users
    createdUsers.forEach(user => {
      console.log(`👤 ${user.name} (${user.role}) - ${user.email} - ID: ${user.employeeId}`);
    });

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@mic.edu / admin123');
    console.log('HOD: hod@mic.edu / hod123');
    console.log('Employee: employee@mic.edu / employee123');
    console.log('Jane: jane.smith@mic.edu / employee123');
    console.log('Mike: mike.johnson@mic.edu / employee123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed function
seedDatabase(); 