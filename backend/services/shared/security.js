const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

function generateToken(payload, options = {}) {
  const signOptions = { expiresIn: config.auth.tokenExpiry, ...options };
  return jwt.sign(payload, config.auth.jwtSecret, signOptions);
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken
};
