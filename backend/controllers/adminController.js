const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const { createToken } = require('../utils/jwt');

// 관리자 등록
exports.register = async (req, res) => {
  const { ADMIN_ID, ADMIN_PASSWORD, ADMIN_NAME, BUILDING_ID } = req.body;
  try {
    const exist = await Admin.findByPk(ADMIN_ID);
    if (exist) return res.status(409).json({ message: '이미 존재하는 ID입니다.' });

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await Admin.create({ ADMIN_ID, ADMIN_PASSWORD: hashed, ADMIN_NAME, BUILDING_ID });
    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//로그인
exports.login = async (req, res) => {
  const { ADMIN_ID, ADMIN_PASSWORD } = req.body;
  try {
    const admin = await Admin.findByPk(ADMIN_ID);
    if (!admin) return res.status(404).json({ message: '존재하지 않는 ID' });

    const valid = await bcrypt.compare(ADMIN_PASSWORD, admin.ADMIN_PASSWORD);
    if (!valid) return res.status(401).json({ message: '비밀번호 불일치' });

    const token = createToken({ ADMIN_ID });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//관리자 정보수정
exports.update = async (req, res) => {
  const { ADMIN_NAME, BUILDING_ID } = req.body;
  try {
    await Admin.update({ ADMIN_NAME, BUILDING_ID }, { where: { ADMIN_ID: req.user.ADMIN_ID } });
    res.json({ message: '정보 수정 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//관리자 삭제
exports.delete = async (req, res) => {
  try {
    await Admin.destroy({ where: { ADMIN_ID: req.user.ADMIN_ID } });
    res.json({ message: '회원 탈퇴 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
