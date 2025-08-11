// utils/featureEncoders.js
const map = new Map([
  ['아파트',0], ['상업',1], ['백화점',2], ['병원',3], ['호텔',4],
  ['전화국(IDC)',5], ['연구소',6], ['공공',7], ['학교',8], ['기타',9],
]);
exports.encodeBuildingType = (t) => map.get(t) ?? 9;
