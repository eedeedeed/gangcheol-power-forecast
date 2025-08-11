const { Admin, BuildingInfo } = require('../models');
const { addressToGeocode } = require('../config/geocoding'); // 카카오/네이버/구글 중 택1
const { convertToGrid } = require('../config/geoUtil');

//건물등록

//request body 값 유효성 검사 - (건물 등록 데이터가 빠진 게 없는지, 값 범위가 정상인지 체크)
function validatePayload(body) {
  const required = ['building_name', 'building_type', 'building_address', 'total_area', 'cooling_area'];
  for (const k of required) {
    if (body[k] === undefined || body[k] === null || body[k] === '') {
      const e = new Error(`필수 필드 누락: ${k}`);
      e.status = 400;
      throw e;
    }
  }
  const total = Number(body.total_area);
  const cool  = Number(body.cooling_area);
  if (!(total > 0)) {
    const e = new Error('total_area 는 0보다 커야 합니다.');
    e.status = 400;
    throw e;
  }
  if (cool < 0 || cool > total) {
    const e = new Error('cooling_area 는 0 이상이며 total_area 이하여야 합니다.');
    e.status = 400;
    throw e;
  }
}

//건물등록
exports.registerBuilding = async (req, res) => {
  const t = await BuildingInfo.sequelize.transaction();

  try {
    validatePayload(req.body); // 유효성검사

    const {
      building_name,
      building_type,
      building_address,
      total_area,
      cooling_area,
      pv_capacity = 0,
      ess_capacity = 0,
      pcs_capacity = 0,
    } = req.body;

    console.log( '-----req.body-----' , req.body);
    
    // 1) 주소 → 위/경도
    const { lat, lon } = await addressToGeocode(building_address);
    console.log('주소 -> 위/경도 변경 OK', lat, lon);
    

    // 2) 위/경도 → 기상 격자(nx, ny)
    const { nx, ny } = convertToGrid(lat, lon);
    console.log("위/경도 -> 기상격자 변경 OK", nx,ny);
    

    // 3) INSERT (cooling_ratio/has_* 는 DB 생성칼럼이 자동 계산)
    const created = await BuildingInfo.create({
      building_name,
      building_type,
      building_address,
      total_area,
      cooling_area,
      pv_capacity,
      ess_capacity,
      pcs_capacity,
      latitude: lat,
      longitude: lon,
      nx,
      ny,
      geocode_status: 'OK',
    }, { transaction: t });

    await t.commit();

    // 생성 칼럼 반영된 최신값 리턴
    const fresh = await BuildingInfo.findByPk(created.building_id);
    return res.status(201).json({
      message: '건물 등록 성공',
      building: fresh,
    });

  } catch (err) {
    await t.rollback();
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
};

//건물조회
exports.getBuildingsByAdminId = async (req, res) => {
  try {
    const adminId = req.params.adminId || req.query.adminId || req.body.ADMIN_ID;
    if (!adminId) {
      return res.status(400).json({ message: 'ADMIN_ID가 필요합니다.' });
    }

    // (옵션) 탈퇴 계정 차단: deletedYN === 'Y'면 404
    const admin = await Admin.findByPk(adminId);
    if (!admin || admin.deletedYN === 'Y') {
      return res.status(404).json({ message: '존재하지 않거나 탈퇴한 관리자입니다.' });
    }

    const buildings = await BuildingInfo.findAll({
      where: { admin_id: adminId },     // 모델 속성명 기준
      attributes: [
        ['BUILDING_ID','building_id'],
        ['BUILDING_NAME','building_name'],
        ['BUILDING_TYPE','building_type'],
        ['BUILDING_ADDRESS','building_address'],
        ['TOTAL_AREA','total_area'],
        ['COOLING_AREA','cooling_area'],
        ['COOLING_RATIO','cooling_ratio'],
        ['PV_CAPACITY','pv_capacity'],
        ['ESS_CAPACITY','ess_capacity'],
        ['PCS_CAPACITY','pcs_capacity'],
        ['HAS_PV','has_pv'],
        ['HAS_ESS','has_ess'],
        ['HAS_PCS','has_pcs'],
        ['LATITUDE','latitude'],
        ['LONGITUDE','longitude'],
        ['NX','nx'],
        ['NY','ny'],
      ],
      order: [['BUILDING_ID','ASC']],
    });

    return res.status(200).json({ admin_id: adminId, count: rows.length, rows });
  } catch (e) {
    console.error('[getBuildingsByAdminId] ', e);
    return res.status(500).json({ message: '건물 조회 중 서버 오류' });
  }
};