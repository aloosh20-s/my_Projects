const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        throw new Error('FATAL: JWT_SECRET is not defined');
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (tokenErr) {
        if (tokenErr.name === 'TokenExpiredError') {
          logger.warn(`Expired token attempt from IP: ${req.ip}`);
          return res.status(401).json({ message: 'Token has expired. Please login again.' });
        }
        logger.warn(`Invalid token attempt from IP: ${req.ip}`);
        return res.status(401).json({ message: 'Not authorized, invalid token signature.' });
      }

      // Get user from the token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (['suspended', 'rejected', 'deleted', 'banned'].includes(req.user.status)) {
        logger.warn(`Suspended user access attempt: User ID ${req.user.id} - Status: ${req.user.status} - IP: ${req.ip}`);
        return res.status(403).json({ message: 'Access denied: account is ' + req.user.status });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    logger.warn(`Forbidden role access attempt (admin required): User ID ${req.user?.id || 'unknown'} - IP: ${req.ip}`);
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const requireWorker = (req, res, next) => {
  if (req.user && req.user.role === 'worker') {
    next();
  } else {
    logger.warn(`Forbidden role access attempt (worker required): User ID ${req.user?.id || 'unknown'} - IP: ${req.ip}`);
    res.status(403).json({ message: 'Not authorized as a worker' });
  }
};

const requireApprovedWorker = (req, res, next) => {
  if (req.user && req.user.role === 'worker') {
    if (req.user.status === 'approved') {
      next();
    } else {
      logger.warn(`Forbidden access attempt (unapproved worker): User ID ${req.user.id} - Status: ${req.user.status} - IP: ${req.ip}`);
      res.status(403).json({ message: `Not authorized: worker account is ${req.user.status}` });
    }
  } else {
    logger.warn(`Forbidden role access attempt (worker required): User ID ${req.user?.id || 'unknown'} - IP: ${req.ip}`);
    res.status(403).json({ message: 'Not authorized as a worker' });
  }
};

const requireCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'client') {
    next();
  } else {
    logger.warn(`Forbidden role access attempt (customer required): User ID ${req.user?.id || 'unknown'} - IP: ${req.ip}`);
    res.status(403).json({ message: 'Not authorized as a customer' });
  }
};

const requireApprovedWorkerOrAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  if (req.user && req.user.role === 'worker' && req.user.status === 'approved') return next();
  
  logger.warn(`Forbidden role access attempt (admin or approved worker required): User ID ${req.user?.id || 'unknown'} - IP: ${req.ip}`);
  res.status(403).json({ message: 'Not authorized' });
};

module.exports = { protect, admin, requireWorker, requireApprovedWorker, requireApprovedWorkerOrAdmin, requireCustomer };
