const { ServiceRequest, User } = require('../models');

// @desc    Create a new custom service request
// @route   POST /api/service-requests
// @access  Private (Customer)
exports.createRequest = async (req, res) => {
  try {
    const { title, description, budget, location, deadline, workerId } = req.body;
    
    // Ensure user is customer (role 'client')
    if (req.user.role !== 'client' && req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can create service requests' });
    }

    const serviceRequest = await ServiceRequest.create({
      customerId: req.user.id,
      title,
      description,
      budget,
      location,
      deadline,
      status: workerId ? 'assigned' : 'open',
      workerId: workerId || null
    });

    res.status(201).json(serviceRequest);
  } catch (error) {
    console.error('Error in createRequest:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get service requests
// @route   GET /api/service-requests
// @access  Private
exports.getRequests = async (req, res) => {
  try {
    let requests;
    
    if (req.user.role === 'worker') {
      // Workers see all open requests PLUS requests they are assigned to
      requests = await ServiceRequest.findAll({
        where: {
          // Simplification: just return all open ones or assigned to this worker
        },
        include: [
          { model: User, as: 'customer', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      // Filter memory side to save complex OR queries for now
      requests = requests.filter(r => r.status === 'open' || r.workerId === req.user.id);
    } else {
      // Customers see their own requests
      requests = await ServiceRequest.findAll({
        where: { customerId: req.user.id },
        include: [
          { model: User, as: 'assignedWorker', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    }

    res.json(requests);
  } catch (error) {
    console.error('Error in getRequests:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Respond to/Accept a service request
// @route   PUT /api/service-requests/:id
// @access  Private (Worker)
exports.respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Only workers can respond to service requests' });
    }

    const serviceRequest = await ServiceRequest.findByPk(id);
    
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    if (serviceRequest.status !== 'open') {
      return res.status(400).json({ message: 'This request is no longer open' });
    }

    // Update request
    serviceRequest.workerId = req.user.id;
    serviceRequest.status = 'assigned';
    await serviceRequest.save();

    res.json(serviceRequest);
  } catch (error) {
    console.error('Error in respondToRequest:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
