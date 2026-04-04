const User = require('./User');
const WorkerProfile = require('./WorkerProfile');
const Service = require('./Service');
const Booking = require('./Booking');
const Review = require('./Review');
const Message = require('./Message');

// User and WorkerProfile
User.hasOne(WorkerProfile, { foreignKey: 'userId', as: 'workerProfile' });
WorkerProfile.belongsTo(User, { foreignKey: 'userId' });

// WorkerProfile and Service (Many to Many handled basically as 1 to Many via User in Service model)
User.hasMany(Service, { foreignKey: 'workerId', as: 'services' });
Service.belongsTo(User, { foreignKey: 'workerId' });

// Bookings
User.hasMany(Booking, { foreignKey: 'clientId', as: 'clientBookings' });
User.hasMany(Booking, { foreignKey: 'workerId', as: 'workerBookings' });
Booking.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Booking.belongsTo(User, { foreignKey: 'workerId', as: 'worker' });
Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });

// Reviews
User.hasMany(Review, { foreignKey: 'clientId', as: 'givenReviews' });
User.hasMany(Review, { foreignKey: 'workerId', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Review.belongsTo(User, { foreignKey: 'workerId', as: 'worker' });

// Messages
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

module.exports = {
  User,
  WorkerProfile,
  Service,
  Booking,
  Review,
  Message
};
