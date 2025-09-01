// utils/featureEncoders.js
// 학습 때 사용한 인코딩과 100% 동일해야 함. (틀리면 성능 폭망)
const typeMap = new Map([
  ['아파트',0], ['상업',1], ['백화점',2], ['병원',3], ['호텔',4],
  ['전화국(IDC)',5], ['연구소',6], ['공공',7], ['학교',8], ['기타',9],
]);
exports.encodeBuildingType = (t) => typeMap.get(t) ?? 9; // 기타 기본
