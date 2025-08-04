const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

exports.createToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: '1d' });
exports.verifyToken = (token) => jwt.verify(token, SECRET);
