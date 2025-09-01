from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import xgboost as xgb

print('Flask 서버 실행 🌟')
app = Flask(__name__)

# ✨ 백엔드(Express) 출처만 허용 (필요에 맞게 수정)
# 예) 백엔드가 http://localhost:5000 이나 http://192.168.111.212:5000 에서 동작
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5000",
    "http://192.168.111.212:5000",
]}})

# 공통: 피처 순서 (백엔드의 features 키들과 반드시 동일)
REQUIRED_FEATURES = [
    "hour_sin", "hour_cos", "weekday", "is_weekend",
    "temperature", "humidity", "wind_speed", "precipitation",
    "log_total_area", "cooling_ratio", "has_pv", "has_ess", "has_pcs",
    "building_type_encoded",
    "lag1", "lag24", "lag168",
]

# 모델 로드
reg_model = joblib.load("./xgboost_power_prediction_model.joblib")   # 회귀
clf_model = xgb.XGBClassifier()
clf_model.load_model("./xgboost_peak_prediction_model.json")        # 분류 (XGBoost JSON)

#디버깅
print("[REG] n_features_in_:", getattr(reg_model, "n_features_in_", None))
try:
    print("[REG] booster feature_names:", reg_model.get_booster().feature_names)
except Exception as e:
    print("[REG] feature_names not available:", e)

print("[CLF] n_features_in_:", getattr(clf_model, "n_features_in_", None))
try:
    print("[CLF] booster feature_names:", clf_model.get_booster().feature_names)
except Exception as e:
    print("[CLF] feature_names not available:", e)

# 유틸
def extract_X(feature_map: dict, required: list[str]):
    """feature_map(dict)에서 required 순서대로 float array 구성"""
    missing = [k for k in required if k not in feature_map]
    if missing:
        return None, f"Missing features: {missing}"
    try:
        row = [float(feature_map[k]) for k in required]
        X = np.array([row], dtype=float)
        # NaN 방지 (있으면 0으로 대체; 필요 시 다른 대체값 적용)
        if np.isnan(X).any():
            X = np.nan_to_num(X, nan=0.0)
        return X, None
    except Exception as e:
        return None, f"Feature type error: {str(e)}"

# 연결 체크
@app.get("/health")
def health():
    return jsonify({"ok": True}), 200

# 메인: 예측 + 피크 (백엔드가 호출)
@app.post("/predict")
def predict():
    """
    요청 JSON:
    - 신버전: { "buildingId": 74, "ts": "...", "features": {...} }
    - 구버전: { "buildingId": 74, "ts": "...", "feature_map": {...} }
    """
    # Content-Type이 어긋나도 파싱되게 force=True
    payload = request.get_json(force=True, silent=True) or {}

    # ✅ 호환: features 우선, 없으면 feature_map 허용
    features = payload.get("features") or payload.get("feature_map") or {}

    # 디버그: 들어온 키 로그(콘솔 확인)
    try:
        print("[/predict] features keys:", list(features.keys()), "count=", len(features))
    except Exception as e:
        print("[/predict] features type:", type(features), "err:", e)

    required = [
        "hour_sin","hour_cos","weekday","is_weekend",
        "temperature","humidity","wind_speed","precipitation",
        "log_total_area","cooling_ratio","has_pv","has_ess","has_pcs",
        "building_type_encoded","lag1","lag24","lag168",
    ]
    missing = [k for k in required if k not in features]
    extra   = [k for k in features.keys() if k not in required]
    if missing or extra:
        return jsonify({
            "error": f"Missing={missing}, Extra={extra}",
            "received_count": len(features),
            "received_keys": list(features.keys()) if hasattr(features, "keys") else str(type(features))
        }), 400

    import numpy as np
    row = [float(features[k]) for k in required]
    X = np.array([row], dtype=float)
    if np.isnan(X).any():
        X = np.nan_to_num(X, nan=0.0)

    yhat  = float(reg_model.predict(X)[0])
    proba = float(clf_model.predict_proba(X)[0, 1])
    label = int(proba >= 0.5)

    return jsonify({"yhat": yhat, "peak": {"is_peak": label, "prob": proba}}), 200


if __name__ == "__main__":
    # 모든 인터페이스에서 수신 + 6000 포트 (백엔드 .env와 일치 필요)
    app.run(host="0.0.0.0", port=6000)
