import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());  // 모든 도메인에서의 요청 허용

app.get('/geocode', async (req, res) => {
  const address = req.query.address;
  const apiKey = 'CFE0BF16-1308-3D7B-A1EA-9AA4AC4FD66D';
  const url = `https://api.vworld.kr/req/address?service=address&request=getCoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(address)}&refine=true&simple=false&type=road&format=json&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'API 호출 실패', detail: error.message });
  }
});

app.listen(5000, () => {
  console.log('✅ 프록시 서버 실행됨: http://localhost:5000');
});
