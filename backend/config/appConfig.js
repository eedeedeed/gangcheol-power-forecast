module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'secretkey',
  port: process.env.PORT || 3000
  // 외부 API 등 추가...
};
