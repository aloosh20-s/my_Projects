require('dotenv').config();
const { sequelize } = require('./config/db');
const { User } = require('./models');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    // Authenticate and sync database
    await sequelize.authenticate();
    console.log('Database connected...');
    
    // Admin credentials
    const adminName = process.env.ADMIN_NAME || 'AlaaSaleh';
    const adminEmail = process.env.ADMIN_EMAIL || 'alhyagem20@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '123#123Aa';
    
    // Check if an admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('An admin account already exists. Seeding aborted.');
      process.exit(0);
    }

    // Create the admin user
    const user = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // Model hook will hash this automatically
      role: 'admin',
      status: 'active',
      phone: '0000000000',
      location: 'System'
    });

    console.log(`
✅ Admin successfully created!
---------------------------------------
Email: ${user.email}
Password: ${adminPassword}
---------------------------------------
WARNING: Please log in immediately and change this default password!
    `);
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:', error);
    process.exit(1);
  }
};

seedAdmin();
