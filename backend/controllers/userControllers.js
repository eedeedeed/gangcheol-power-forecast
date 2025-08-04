// backend/controllers/userControllers.js
const { User,UserToken } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.updatedAt // updatedAt 또는 별도 lastLogin 컬럼
    });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

exports.register = async (req, res) => {
  // 사용자 이름은 더 이상 필수 아님 (프론트에서 제거할 것이므로)
 const { username, email, password } = req.body;
  if (!username || !email || !password) {
  return res.status(400).json({ message: '이메일, 사용자 이름, 비밀번호를 모두 입력하세요.' });
}

  try {
    // 1. 이메일 중복 확인 (이미 구현됨)
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: '이미 가입된 이메일 주소입니다.' }); // 요청하신 메시지
    }

    // 2. 사용자 이름 중복 확인 (이메일을 ID로 사용할 것이므로 필요 없음, 제거)
    // const existingUsername = await User.findOne({ where: { username } });
    // if (existingUsername) {
    //   return res.status(409).json({ message: '이미 사용 중인 사용자 이름입니다.' });
    // }

    // 3. 새 사용자 생성 (username 필드가 있다면 null 또는 기본값으로 저장)
    const newUser = await User.create({
      username,
      email,
      password
    });

    // 4. JWT 토큰 생성
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // ---> 토큰을 저장
    await UserToken.create({ user_id: newUser.id, token });


    res.status(201).json({ message: '회원가입이 성공적으로 완료되었습니다.', token });
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    res.status(500).json({ message: '회원가입 중 서버 오류가 발생했습니다.' });
  }
};

// 로그인 (login 함수):
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '아이디 또는 비밀번호가 틀렸습니다.' }); // 요청하신 메시지
    }

    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 틀렸습니다.' }); // 요청하신 메시지
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    await UserToken.create({ user_id: user.id, token });

    res.status(200).json({ message: '로그인 성공', token });
  } catch (error) {
    console.error('로그인 중 오류 발생:', error);
    res.status(500).json({ message: '로그인 중 서버 오류가 발생했습니다.' });
  }
};
