const { WorkerProfile, User } = require('../models');

// @desc    Get worker profile
// @route   GET /api/workers/profile
// @access  Private/Worker
const getWorkerProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['name', 'email', 'phone', 'profileImage'] }]
    });

    if (!profile) {
      // Create empty profile if it doesn't exist
      const newProfile = await WorkerProfile.create({
        userId: req.user.id,
        experience: 'Not specified',
        hourlyRate: 15.0,
        description: 'New worker account',
      });
      return res.json(newProfile);
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private/Worker
const updateWorkerProfile = async (req, res) => {
  try {
    const { experience, skills, hourlyRate, description, availability, profileImage } = req.body;
    let profile = await WorkerProfile.findOne({ where: { userId: req.user.id } });

    if (!profile) {
      profile = await WorkerProfile.create({
        userId: req.user.id,
        experience: experience || 'Not specified',
        skills: skills || [],
        hourlyRate: hourlyRate || 15.0,
        description: description || '',
        availability: availability || []
      });
    } else {
      profile.experience = experience || profile.experience;
      if (skills) profile.skills = skills;
      if (hourlyRate) profile.hourlyRate = hourlyRate;
      profile.description = description || profile.description;
      if (availability) profile.availability = availability;
      
      await profile.save();
    }

    // Update avatar on User model if provided
    if (profileImage) {
      const user = await User.findByPk(req.user.id);
      if (user) {
        user.profileImage = profileImage;
        await user.save();
      }
    }

    // Re-fetch profile with User to return updated image
    const updatedProfile = await WorkerProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['name', 'email', 'phone', 'profileImage'] }]
    });

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all workers
// @route   GET /api/workers
// @access  Public
const getAllWorkers = async (req, res) => {
  try {
    const workers = await WorkerProfile.findAll({
      include: [{ model: User, attributes: ['name', 'email', 'profileImage', 'location'] }]
    });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get worker by ID
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res) => {
  try {
    const worker = await WorkerProfile.findOne({
      where: { userId: req.params.id },
      include: [{ model: User, attributes: ['name', 'email', 'profileImage', 'location'] }]
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkerProfile,
  updateWorkerProfile,
  getAllWorkers,
  getWorkerById
};
