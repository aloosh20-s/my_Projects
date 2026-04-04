const { Service, User } = require('../models');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'profileImage'], as: 'User' }] // From User.hasMany(Service) ... Service.belongsTo(User, { foreignKey: 'workerId' }) -- wait, the alias is not set in belongsTo in models/index.js.
    });
    // Let's rely on default alias or just fetch raw services first
    // In models/index.js: Service.belongsTo(User, { foreignKey: 'workerId' });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Worker
const createService = async (req, res) => {
  try {
    const { title, category, description, price, estimatedTime, images } = req.body;
    
    if (req.user.role !== 'worker' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only workers can create services' });
    }

    const service = await Service.create({
      workerId: req.user.id,
      title,
      category,
      description,
      price,
      estimatedTime,
      images: images || []
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Worker
const updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.workerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const updatedService = await service.update(req.body);
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Worker
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.workerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await service.destroy();
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
