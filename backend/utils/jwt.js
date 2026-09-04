const jwt = require('jsonwebtoken');

const getSecret = () => process.env.JWT_SECRET || 'memora_default_jwt_secret_change_in_production';

const generateToken = (userId) => {
  return jwt.sign({ userId }, getSecret(), { expiresIn: '7d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};

module.exports = {
  generateToken,
  verifyToken
};
