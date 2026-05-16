const { Booking, Service, User } = require('../models');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/Client
const createBooking = async (req, res) => {
  try {
    const { serviceId, date } = req.body;
    
    // Find service to get workerId
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Verify worker status
    const worker = await User.findByPk(service.workerId);
    if (!worker || worker.status !== 'approved') {
      return res.status(403).json({ message: 'Cannot book this service at the moment' });
    }

    const booking = await Booking.create({
      clientId: req.user.id,
      workerId: service.workerId,
      serviceId,
      date,
      price: service.price, // backend sets price
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Emit to worker
    const io = req.app.get('io');
    io.to(`user_${service.workerId}`).emit('new_booking', {
      id: booking.id,
      serviceTitle: service.title,
      clientName: req.user.name
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for logged in customer
// @route   GET /api/bookings/client
// @access  Private/Client
const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { clientId: req.user.id },
      include: [
        { model: Service },
        { model: User, as: 'worker', attributes: ['name', 'email', 'phone'] }
      ]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for logged in worker
// @route   GET /api/bookings/worker
// @access  Private/Worker
const getWorkerBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { workerId: req.user.id },
      include: [
        { model: Service },
        { model: User, as: 'client', attributes: ['name', 'email', 'phone'] }
      ]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure only the worker handling it or client who created it can update it 
    if (booking.workerId !== req.user.id && booking.clientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'client' && ['accepted', 'completed'].includes(status)) {
      return res.status(403).json({ message: 'Client cannot change status to accepted or completed' });
    }

    if (req.user.role === 'worker' && booking.workerId !== req.user.id) {
      return res.status(403).json({ message: 'Worker cannot update this booking' });
    }

    booking.status = status;
    await booking.save();

    // Emit to client
    const io = req.app.get('io');
    io.to(`user_${booking.clientId}`).emit('booking_status_updated', {
      id: booking.id,
      status: booking.status
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getWorkerBookings,
  updateBookingStatus
};
