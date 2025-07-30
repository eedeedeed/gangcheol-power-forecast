//토큰 검증
const jwt = require('jsonwebtoken');
// JWT 비밀키 가져오기
const config = require('../config/config');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  // 토큰이 없으면 인증 실패 응답(토큰 존재 여부 확인)
    if (!token){
      return res.status(401).json({ error: '인증 토큰이 없습니다. 로그인 후 다시 시도해주세요' });
    }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT 검증 오류:',err.message);
    return res.status(403).json({ error: '유효하지 않은 토큰입니다. 다시 로그인해주세요.' });
  }
};

module.exports = authMiddleware;