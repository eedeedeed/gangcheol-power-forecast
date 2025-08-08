from flask import Flask, request, jsonify
import joblib
import numpy as np

# Flask 서버 생성
app = Flask(__name__)

# 저장된 모델 불러오기
model = joblib.load("./xgb_model.pkl")  # 경로 확인!

# 라우터 정의
@app.route("/predict", methods=["POST"])

# 예측
def predict():
    data = request.json["features"]  # JSON으로 입력받기
    arr = np.array(data).reshape(1, -1)  # 1건 입력
    prediction = model.predict(arr)
    return jsonify({"prediction": float(prediction[0])})

# 서버실행
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
