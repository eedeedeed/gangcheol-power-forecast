const axios = require("axios");

//feature값 받아오는곳
const features = [0.0, 1.0, 5.0, 1.0, 19.9, 67.0, 2.3, 0.8, 11.3255557074255, 0.935755205685594, 0.0, 0.0, 0.0, 5.0, 5652.33, 3948.39, 5794.8]

// 아래주소로 post 요청
axios.post("http://192.168.111.211:5000/predict", {
    features: features
}) // 예측값 응답
.then(res => {
  console.log("예측 전력소비량:", res.data.prediction.toFixed(2), "kWh");
})
.catch(err => {
  console.error("❌ 예측 실패:");
  console.error(err.response?.data || err.message || err);
});
