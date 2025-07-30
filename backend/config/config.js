//전반적인 설정 정의
//민감한 정보는 이곳에 저장하고, 보안 강화

module.exports = { //외부로 내보내기
  jwtSecret: process.env.JWT_SECRET || 'secretkey', // .env에서 값을 가져오고, 없으면 기본값 사용

  //서버포트 설정
  port: process.env.PORT || 3000 // .env에서 값을 가져오고, 없으면 기본값 사용

  //외부 API 키...
};