// Report 모델: 데이터 조작, User 모델: 작성자 정보 조회
const { Report,User } = require('../models');

// 새 리포트 생성
exports.createReport = async (req, res) => {
  try {
    const {title,content,energyUsage,carbonEmission} = req.body; 
    const userId = req.user.id; // 인증된 사용자 ID 가져오기

    // 리포트 제목과 사용자 ID가 모두 입력되었는지 확인
    if (!title || !content) {
      return res.status(400).json({ error: '리포트 제목과 유효한 사용자 정보가 필요합니다.' });
    }

    // 새 리포트 생성
    const newReport = await Report.create({
      userId, // 작성자 ID 설정
      title,
      content,
      energyUsage,
      carbonEmission
    });

    res.status(201).json({ message: '리포트가 성공적으로 생성되었습니다.', reportId: newReport.id });
  } catch (err) {
    console.error('리포트 생성 중 오류 발생',err);
    res.status(500).json({ error: '리포트 생성 실패', details: err.message });
  }
};

// 모든 리포트 조회
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.findAll({
            include: [{
                model: User,    // 연관된 User 모델을 포함
                as: 'user',     // Report 모델에서 User 모델을 'user'라는 별칭으로 참조
                attributes: ['id', 'username'] // User 모델에서 가져올 컬럼을 특정 (보안상 비밀번호 등 민감 정보는 제외)
            }]
        });

        // 성공 응답:
        res.status(200).json(reports);
    } catch (err) {
        console.error('모든 리포트 조회 중 오류 발생:', err);
        res.status(500).json({ error: '리포트 조회 실패', details: err.message });
    }
};

// 특정 리포트 ID 조회
exports.getReportById = async (req, res) => {
  try {
    const {id} = req.params; // URL 파라미터에서 리포트 ID 가져오기
    // 작성자 정보 포함(모델 정보도...)
    const report = await Report.findByPk(id, {
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['id', 'username'] 
      }]
    });

    // 리포트 존재 여부 확인
    if (!report) {
      return res.status(404).json({ error: '요청하신 리포트를 찾을 수 없습니다.' });
    }

    // 성공 응답
    res.status(200).json(report);
  } catch (err) {
    console.error('특정 리포트 조회 중 오류 발생',err);
    res.status(500).json({ error: '리포트 조회 실패', details: err.message });
  }
};