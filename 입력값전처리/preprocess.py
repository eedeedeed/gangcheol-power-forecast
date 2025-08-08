import numpy as np
from building_type import building_type_dict


def preprocess_input(data):
    # 시간 파생
    hour = data['hour']
    hour_sin = np.sin(2 * np.pi * hour / 24)
    hour_cos = np.cos(2 * np.pi * hour / 24)

    # 요일 및 주말 여부
    weekday = data['weekday']
    is_weekend = 1 if weekday >= 5 else 0

    # 면적 관련
    total_area = data['total_area']
    cooling_area = data['cooling_area']
    cooling_ratio = cooling_area / total_area if total_area > 0 else 0
    log_total_area = np.log1p(total_area)  # log(면적 + 1)

    # PV / ESS / PCS 여부
    has_pv = 1 if data['pv_capacity'] > 0 else 0
    has_ess = 1 if data['ess_capacity'] > 0 else 0
    has_pcs = 1 if data['pcs_capacity'] > 0 else 0

    # 건물 유형 인코딩
    building_type = data['building_type']
    building_type_encoded = building_type_dict.get(building_type, 0)

    # 최종 feature list
    features = [
        hour_sin, hour_cos, weekday, is_weekend,
        data['temperature'], data['humidity'], data['wind_speed'],
        data['precipitation'],
        log_total_area, cooling_ratio,
        has_pv, has_ess, has_pcs,
        building_type_encoded,
        data['lag1'], data['lag24'], data['lag168'],
    ]

    return np.array([features])