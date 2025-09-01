const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateAdmin = (req, res, next) => {
  // Authorization 헤더 형식: "Bearer 토큰값"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '토큰이 존재하지 않습니다.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // 토큰에서 ADMIN_ID, ADMIN_NAME 등 필요한 정보가 들어있음
    req.admin = {
      ADMIN_ID: decoded.ADMIN_ID,
      ADMIN_NAME: decoded.ADMIN_NAME,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = authenticateAdmin;
