const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const supervisorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'supervisor') return next();
  res.status(403).json({ message: 'Access denied: supervisors only' });
};

const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'student') return next();
  res.status(403).json({ message: 'Access denied: students only' });
};

module.exports = { protect, supervisorOnly, studentOnly };
