const { verifyToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '토큰 없음' });

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(403).json({ message: '유효하지 않은 토큰' });
  }
};
