require('dotenv').config();
const { sequelize } = require('./config/db');
const { User, WorkerProfile, Service, Booking, Report } = require('./models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // 1. Create a dummy customer
    const customer = await User.create({
      name: 'John Customer',
      email: 'john.customer@example.com',
      password: 'Password123!',
      role: 'client',
      status: 'active',
      phone: '1234567890',
      location: 'New York'
    });

    // 2. Create a pending worker
    const worker1 = await User.create({
      name: 'Pending Plumber',
      email: 'plumber.pending@example.com',
      password: 'Password123!',
      role: 'worker',
      status: 'pending',
      phone: '0987654321',
      location: 'Brooklyn'
    });
    await WorkerProfile.create({
      userId: worker1.id,
      experience: '5 years',
      hourlyRate: 50.0,
      description: 'I fix pipes.'
    });

    // 3. Create an approved worker
    const worker2 = await User.create({
      name: 'Approved Electrician',
      email: 'electrician.approved@example.com',
      password: 'Password123!',
      role: 'worker',
      status: 'approved',
      phone: '1122334455',
      location: 'Queens'
    });
    await WorkerProfile.create({
      userId: worker2.id,
      experience: '10 years',
      hourlyRate: 75.0,
      description: 'I fix wires.'
    });

    // 4. Create a service for the approved worker
    const service1 = await Service.create({
      title: 'Full House Rewiring',
      description: 'Complete electrical rewiring of your house safely.',
      category: 'Electrical',
      price: 500,
      workerId: worker2.id
    });

    // 5. Create a booking
    const booking1 = await Booking.create({
      serviceId: service1.id,
      clientId: customer.id,
      workerId: worker2.id,
      date: new Date(Date.now() + 86400000), // Tomorrow
      status: 'pending',
      price: service1.price
    });

    // 6. Create a report
    await Report.create({
      reporterId: customer.id,
      targetType: 'worker',
      targetId: worker1.id,
      reason: 'This worker was very rude in the chat.'
    });

    console.log('✅ Mock Workers, Services, Bookings, and Reports have been seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed data:', error);
    process.exit(1);
  }
};

seedData();
