// utils/tokens.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const ACCESS_EXPIRES = '15m'; // 짧게
const REFRESH_DAYS_DEFAULT = 1;   // rememberMe=false
const REFRESH_DAYS_REMEMBER = 30; // rememberMe=true

exports.signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

exports.verifyAccess = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

exports.generateRefreshPlain = () =>
  crypto.randomBytes(64).toString('hex');

exports.hashRefresh = async (plain) =>
  await bcrypt.hash(plain, 10);

exports.compareRefresh = async (plain, hash) =>
  await bcrypt.compare(plain, hash);

exports.getRefreshExpiry = (rememberMe=false) => {
  const d = new Date();
  d.setDate(d.getDate() + (rememberMe ? REFRESH_DAYS_REMEMBER : REFRESH_DAYS_DEFAULT));
  return d;
};
