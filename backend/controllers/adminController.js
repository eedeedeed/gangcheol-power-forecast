const { Admin } = require('../models');
const bcrypt = require('bcryptjs');
const { request } = require('express');
const jwt = require('jsonwebtoken');

// 관리자 회원가입
exports.createAdmin = async (req, res) => {
  try {
    const { ADMIN_ID, ADMIN_PASSWORD, ADMIN_NAME } = req.body;

    // 아이디 중복확인
    const existingAdmin = await Admin.findByPk(ADMIN_ID);
    console.log(existingAdmin);
    
    if (existingAdmin) {
      return res.status(409).json({ message: '이미 존재하는 관리자 ID입니다.' });
    }

    // 비밀번호 암호화
    //const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10); - 두번 해싱됨 지워

    // 관리자 생성
    const newAdmin = await Admin.create({
      ADMIN_ID,
      ADMIN_PASSWORD,
      ADMIN_NAME,
    });

    res.status(201).json({ message: '관리자 등록 완료', admin: newAdmin });
  } catch (err) {
    console.error('Admin insert error:', err);
    res.status(500).json({ error: '관리자 등록 실패' });
  }
};

// 관리자 로그인 (JWT 토큰 발급)
exports.loginAdmin = async (req, res) => {
  const { ADMIN_ID, ADMIN_PASSWORD } = req.body;

  try {
    // 1. 관리자 존재 여부 확인
    const admin = await Admin.findByPk(ADMIN_ID);
    console.log("front:",ADMIN_PASSWORD, "DB:",admin.ADMIN_PASSWORD);
    
    if (!admin) {
      return res.status(404).json({ message: '존재하지 않는 관리자 ID입니다.' });
    }

    // 2. 비밀번호 비교
    const isMatch = await bcrypt.compare(ADMIN_PASSWORD, admin.ADMIN_PASSWORD);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 3. JWT 토큰 발급
    const token = jwt.sign(
      { ADMIN_ID: admin.ADMIN_ID, BUILDING_ID: admin.BUILDING_ID },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: '로그인 성공',
      token,
      admin: { ADMIN_ID: admin.ADMIN_ID, ADMIN_NAME: admin.ADMIN_NAME }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류로 로그인 실패' });
  }
};

// 관리자 로그아웃
exports.logoutAdmin = async (req, res) => {
  try {
    // 서버에서는 별다른 데이터베이스 작업이 필요하지 않습니다.
    // 클라이언트 측에서 로컬 스토리지 등에 저장된 토큰을 삭제하는 것으로 로그아웃이 완료됩니다.
    res.status(200).json({ message: '로그아웃 성공' });
  } catch (error) {
    console.error('로그아웃 오류:', error);
    res.status(500).json({ message: '로그아웃 실패' });
  }
};