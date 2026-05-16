const { User, WorkerProfile, Service, Booking, Report } = require('../models');
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getAllWorkers = async (req, res) => {
  try {
    const workers = await User.findAll({
      where: { role: 'worker' },
      attributes: { exclude: ['password'] },
      include: [{ model: WorkerProfile, as: 'workerProfile' }]
    });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (status) {
      user.status = status;
      logger.info(`Admin User ${req.user.id} updated User ${user.id} status to ${status}`);
    }
    if (role) {
      user.role = role;
      logger.info(`Admin User ${req.user.id} updated User ${user.id} role to ${role}`);
    }
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({ include: [{ model: User }] });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const disableService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    
    // We can soft delete or add a disabled flag. For now, delete.
    await service.destroy();
    logger.info(`Admin User ${req.user.id} deleted Service ${req.params.id}`);
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'client', attributes: ['id', 'name'] },
        { model: User, as: 'worker', attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'title'] }
      ]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll({ order: [['createdAt', 'DESC']] });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    
    report.status = status;
    await report.save();
    logger.info(`Admin User ${req.user.id} updated Report ${report.id} status to ${status}`);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getSecurityLogs = (req, res) => {
  try {
    const logPath = path.join(__dirname, '../logs/all.log');
    if (!fs.existsSync(logPath)) return res.json([]);
    const logs = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean).slice(-100); // last 100 lines
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllWorkers,
  updateUserStatus,
  getAllServices,
  disableService,
  getAllBookings,
  getAllReports,
  updateReportStatus,
  getSecurityLogs
};
