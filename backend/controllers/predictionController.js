// controllers/predictionController.js

// AI 모델 예측 로직을 담당하는 컨트롤러입니다.
// 실제 AI 모델은 주로 Python으로 개발되므로, 이 컨트롤러는 일반적으로
// 별도의 Python 서버에 HTTP 요청을 보내는 방식으로 통합됩니다.

// AI 예측에 데이터베이스의 추가 데이터(예: 건물 정보, 과거 데이터)가 필요한 경우,
// models/index.js에서 필요한 모델을 불러올 수 있습니다.
// const { BuildingInfoModel, HistoricalPowerDataModel } = require('../models'); // 예시 불러오기

const predictPowerConsumption = async (req, res) => {
    try {
        // 1. 클라이언트로부터 예측에 필요한 데이터 받기:
        // 프론트엔드 클라이언트는 건물 번호, 예측 시간, 기상 정보(기온, 습도 등)와 같은 주요 데이터를 req.body로 보냅니다.
        // 예시: { building_number: 1, date: '2024-08-01', hour: 10, temperature: 28.5, humidity: 70 }
        const inputData = req.body;

        // --- AI 모델 데이터 전처리 및 모델 호출 공간 ---

        // 2. AI 모델 예측을 위한 데이터베이스에서 추가 데이터 가져오기 (데이터 가져올 공간):
        // AI 모델은 종종 과거 전력 사용량, 건물 특성(예: 연면적, 냉방 면적),
        // 또는 특정 기간의 기상 데이터 등 데이터베이스에 저장된 정보를 필요로 할 수 있습니다.
        // 이 섹션에서 데이터베이스를 쿼리하여 이 데이터를 inputData와 결합할 수 있습니다.
        // 예시: 특정 건물 번호에 해당하는 건물 정보 조회
        /*
        const buildingInfo = await BuildingInfoModel.findOne({ where: { building_number: inputData.building_number } });
        if (!buildingInfo) {
            return res.status(404).json({ error: '건물 정보를 찾을 수 없습니다.' });
        }
        // 예시: 과거 N시간의 전력 사용량 데이터 조회 (시계열 예측 모델에 필요)
        // const historicalData = await PowerConsumptionModel.findAll({
        //     where: { building_number: inputData.building_number, date: { [Op.lte]: inputData.date } },
        //     order: [['date', 'DESC']],
        //     limit: N
        // });
        */

        // 3. 통합된 입력 데이터 전처리 (AI 모델이 기대하는 형식으로 변환):
        // 이 단계는 AI 모델이 훈련될 때 사용했던 전처리 방식과 정확히 일치해야 합니다.
        // (예: 날짜/시간 데이터를 요일, 시간, 월과 같은 시계열 특성으로 분해;
        // 범주형 데이터를 원-핫 인코딩 또는 레이블 인코딩; 숫자형 데이터 스케일링)
        // 이 전처리 로직은 복잡할 수 있으므로 별도의 유틸리티 함수로 분리하는 것이 가장 좋습니다.
        // Dacon 데이터 전처리 Python 코드의 로직을 Node.js 환경에 맞게 재구현하거나,
        // Python AI 서버에서 전처리 자체를 담당하도록 할 수 있습니다.
        const preprocessedData = {
            // inputData와 데이터베이스에서 가져온 데이터를 결합하고
            // AI 모델의 입력 요구 사항에 맞게 포맷합니다.
            // 예: inputData.temperature, inputData.humidity, buildingInfo.area, historicalData.map(...) 등
            ...inputData, // 현재는 받은 inputData를 그대로 사용
            // building_area: buildingInfo ? buildingInfo.area : null, // 가져온 데이터를 추가하는 예시
            // ... (추가 전처리된 특성들)
        };

        // 4. AI 모델 호출 (가장 일반적인 방법: 별도의 Python 서버에 HTTP 요청):
        // Python으로 개발된 AI 모델을 Node.js에서 직접 실행하는 것은 어렵습니다.
        // 권장되는 접근 방식은 AI 모델을 별도의 마이크로서비스(예: Python의 Flask, FastAPI)로 호스팅하고,
        // Node.js 백엔드에서 이 Python 서버의 예측 API에 HTTP 요청을 보내 결과를 받는 것입니다.
        // 'http://localhost:5000/predict'는 Python AI 서버의 가상 주소입니다.
        // fetch API를 사용하여 비동기적으로 예측 요청을 보냅니다.
        /*
        const aiModelResponse = await fetch('http://localhost:5000/predict', {
            method: 'POST', // 예측 요청은 일반적으로 POST 방식
            headers: {
                'Content-Type': 'application/json' // 데이터를 JSON 형식으로 전송
            },
            body: JSON.stringify(preprocessedData) // 전처리된 데이터를 JSON 문자열로 변환하여 전송
        });

        // HTTP 응답 상태 코드 확인
        if (!aiModelResponse.ok) {
            const errorBody = await aiModelResponse.text();
            throw new Error(`AI 모델 서버 오류: ${aiModelResponse.status} - ${errorBody}`);
        }

        // Python 서버로부터 받은 JSON 응답을 파싱합니다.
        const predictionResult = await aiModelResponse.json();
        // Python 서버가 반환한 예측값 (예: 'prediction'이라는 키로 반환된다고 가정)
        const predictedConsumption = predictionResult.prediction;
        */

        // 5. 임시 예측값 (실제 AI 모델 통합 전 테스트용):
        // 위에 주석 처리된 실제 AI 모델 호출 코드를 활성화하기 전까지는,
        // 이 임의의 값을 사용하여 API가 정상적으로 작동하는지 테스트할 수 있습니다.
        const predictedConsumption = Math.random() * 1000 + 100; // 100에서 1100 사이의 임의 전력 사용량 (kWh)

        // --- AI 모델 통합 공간 끝 ---

        // 6. 성공 응답:
        // 예측 결과와 성공 메시지를 200 OK 상태 코드와 함께 클라이언트에게 반환합니다.
        res.status(200).json({
            message: '전력 사용량 예측 성공',
            predicted_consumption_kwh: predictedConsumption,
            // 디버깅을 위해 받은 입력 데이터를 함께 반환할 수도 있습니다.
            input_data_received: inputData
        });

    } catch (error) {
        // 7. 오류 처리:
        // 오류를 콘솔에 로깅하고, 500 Internal Server Error 응답을 클라이언트에 보냅니다.
        console.error('❌ 전력 사용량 예측 중 오류 발생:', error);
        res.status(500).json({
            error: '전력 사용량 예측 실패',
            details: error.message // 상세 오류 메시지 포함
        });
    }
};

// 컨트롤러 함수를 외부로 내보냅니다.
module.exports = {
    predictPowerConsumption
};
