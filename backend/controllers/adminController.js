const { Admin } = require('../models');
const bcrypt = require('bcryptjs');
const { request } = require('express');
const jwt = require('jsonwebtoken');

// 관리자 회원가입
exports.createAdmin = async (req, res) => {
  try {
    const { ADMIN_ID, ADMIN_PASSWORD, ADMIN_NAME, BUILDING_ID } = req.body;

    // 아이디 중복확인
    const existingAdmin = await Admin.findByPk(ADMIN_ID);
    console.log(existingAdmin);
    
    if (existingAdmin) {
      return res.status(409).json({ message: '이미 존재하는 관리자 ID입니다.' });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // 관리자 생성
    const newAdmin = await Admin.create({
      ADMIN_ID,
      ADMIN_PASSWORD: hashedPassword,
      ADMIN_NAME,
      BUILDING_ID
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

// 관리자 수정
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { ADMIN_NAME, BUILDING_ID } = req.body;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: '관리자를 찾을 수 없습니다.' });
    }

    if (ADMIN_NAME !== undefined) admin.ADMIN_NAME = ADMIN_NAME;
    if (BUILDING_ID !== undefined) admin.BUILDING_ID = BUILDING_ID;

    await admin.save();

    res.status(200).json({ message: '관리자 정보가 수정되었습니다.', admin });
  } catch (error) {
    console.error('관리자 수정 오류:', error);
    res.status(500).json({ message: '서버 오류로 관리자 정보 수정 실패' });
  }
};

// 관리자 삭제(탈퇴) - deletedYN 컬럼
exports.deleteAdmin = async (req, res) => {
  const { ADMIN_ID } = req.body;

  try {
    const admin = await Admin.findByPk(ADMIN_ID);
    if (!admin) {
      return res.status(404).json({ message: '존재하지 않는 관리자입니다.' });
    }

    if (admin.deletedYN === 'Y') {
      return res.status(400).json({ message: '이미 탈퇴한 관리자입니다.' });
    }

    admin.deletedYN = 'Y';
    await admin.save();

    res.status(200).json({ message: '관리자 탈퇴 처리 완료' });
  } catch (error) {
    console.error('회원 탈퇴 오류:', error);
    res.status(500).json({ message: '회원 탈퇴 실패' });
  }
};
