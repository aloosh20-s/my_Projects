const bcrypt = require('bcryptjs');
const { User } = require('./models');
const { sequelize } = require('./config/db');

async function test() {
  await sequelize.sync();
  
  const email = 'test' + Date.now() + '@example.com';
  const password = 'password123';
  
  console.log('Creating user with password:', password);
  const user = await User.create({
    name: 'Test User',
    email,
    password
  });
  
  console.log('Saved password in DB:', user.password);
  
  const match = await bcrypt.compare(password, user.password);
  console.log('Bcrypt direct match:', match);
  
  const matchMethod = await user.matchPassword(password);
  console.log('User method match:', matchMethod);

  // Clean up
  await user.destroy();
}

test().then(() => console.log('Test complete')).catch(console.error);
