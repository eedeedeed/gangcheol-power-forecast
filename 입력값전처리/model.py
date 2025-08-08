from flask import Flask, request, jsonify
import joblib
import numpy as np
from preprocess import preprocess_input 

# Flask 서버 생성
app = Flask(__name__)

# 저장된 모델 불러오기
model = joblib.load("./xgb_model.pkl")  # 경로 확인!

@app.route("/predict", methods=["POST"])

def predict():

    input_data = request.get_json()

    # 1. 입력 전처리: input_data → 모델 입력 feature 형태로
    features = preprocess_input(input_data)  # ⬅️ 여기에 sin/cos, 비율 계산, bool 처리 등 포함

    # 2. 모델 예측
    prediction = model.predict(features)

    return jsonify({'prediction': prediction.tolist()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
