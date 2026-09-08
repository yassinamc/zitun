const jwt = require('jsonwebtoken');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'oliveflow_jwt_access_secret_zitune_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'oliveflow_jwt_refresh_secret_zitune_2026';

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '1d',
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
