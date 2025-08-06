const { BuildingInfo } = require('../models');

//건물등록
exports.registerBuilding = async (req, res) => {
  try {
    const data = req.body;

    await BuildingInfo.create(data);
    res.status(201).json({ message: '건물 등록 성공' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//건물수정
exports.updateBuilding = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const updated = await BuildingInfo.update(data, {
      where: { BUILDING_ID: id }
    });

    if (updated[0] === 0) {
      return res.status(404).json({ message: '건물이 존재하지 않습니다.' });
    }

    res.status(200).json({ message: '건물 정보 수정 성공' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//건물삭제
exports.deleteBuilding = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await BuildingInfo.destroy({
      where: { BUILDING_ID: id }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: '건물이 존재하지 않습니다.' });
    }

    res.status(200).json({ message: '건물 삭제 성공' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//건물조회
exports.getBuildingList = async (req, res) => {
  try {
    const { admin_id } = req.query;
    if (!admin_id) {
      return res.status(400).json({ message: 'admin_id가 필요합니다.' });
    }
    //관리자 아이디 - 건물 연결된것만 조회
    const buildings = await BuildingInfo.findAll({
      where: { ADMIN_ID: admin_id }
    });

    res.status(200).json(buildings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
