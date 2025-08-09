const { signAccess, generateRefreshPlain, hashRefresh, getRefreshExpiry } = require('../config/token');
const { REFRESH_TOKEN, ADMIN } = require('../models'); // 모델 import
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  const { ADMIN_ID, ADMIN_PASSWORD, rememberMe } = req.body;
  const admin = await ADMIN.findByPk(ADMIN_ID);
  if (!admin) return res.status(401).json({ message: '존재하지 않는 ID' });
  if (admin.deletedYN === 'Y') return res.status(403).json({ message: '탈퇴한 계정' });

  const ok = await bcrypt.compare(ADMIN_PASSWORD, admin.ADMIN_PASSWORD);
  if (!ok) return res.status(401).json({ message: '비밀번호 불일치' });

  // access
  const accessToken = signAccess({ sub: ADMIN_ID });

  // refresh (opaque)
  const refreshPlain = generateRefreshPlain();
  const refreshHash = await hashRefresh(refreshPlain);
  const expiresAt = getRefreshExpiry(!!rememberMe);

  await REFRESH_TOKEN.create({
    ADMIN_ID,
    token_hash: refreshHash,
    expires_at: expiresAt,
    user_agent: req.headers['user-agent'] || null,
    ip: req.ip || req.connection?.remoteAddress || null,
  });

  // 쿠키 설정
  res.cookie('rt', refreshPlain, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,           // rememberMe에 따라 다름
    path: '/auth',                // refresh·logout 경로에만 보이게
  });

  return res.json({ accessToken });
};
