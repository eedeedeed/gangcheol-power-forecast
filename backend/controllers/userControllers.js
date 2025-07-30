const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// 사용자 인증 후 JWT 생성
const config = require('../config/config');

// 회원가입
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 사용자명과 비밀번호가 모두 입력되었는지 확인
    if (!username || !password) {
      return res.status(400).json({ error: '사용자명과 비밀번호를 모두 입력해주세요.' });
    }

    // 사용자 이름 중복 확인
    const existingUser = await User.findOne({ where: { username } }); // .findOne() 사용 (where 절)
    if (existingUser) {
      return res.status(409).json({ error: '이미 존재하는 사용자명입니다.' })
    };

    // 사용자 생성
    const newUser = await User.create({ username, password});

    res.status(201).json({ message: '회원가입 성공', userId: newUser.id });
  } catch (err) {
    console.error('회원가입 중 오류 발생:', err);
    res.status(500).json({ error: '회원가입 실패', details: err.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 사용자명과 비밀번호가 모두 입력되었는지 확인
    if (!username || !password) {
      return res.status(400).json({ error: '사용자명과 비밀번호를 모두 입력해주세요.' });
    }
    
    // 사용자 존재 여부 확인
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: '잘못된 사용자 이름 또는 비밀번호입니다.' })
    };

    // 비밀번호 일치 여부 확인
    const isMatch = await user.comparePassword(password); // Sequelize 모델 인스턴스는 .comparePassword 메서드 사용
    if (!isMatch) {
      return res.status(401).json({ error: '비밀번호가 틀렸습니다.' })
    };

    //JWT 토큰 생성(로그인 성공 시)
    const token = jwt.sign(
      { id: user.id },
      config.jwtSecret,
      { expiresIn: '1h' }
    ); // Sequelize 모델 인스턴스는 .id로 접근

    //성공 응답
    res.status(200).json({ message: '로그인 성공', token });
  } catch (err) {
    console.error('로그인 중 오류 발생',err);
    res.status(500).json({ error: '로그인 실패', details: err.message });
  }
};