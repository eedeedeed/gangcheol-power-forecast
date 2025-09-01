// api/replay.js
import axiosInstance, { API_BASE_URL } from './axiosInstance';

/**
 * 빌딩별 리플레이 스트림 시작 (SSE)
 * @param {number} buildingId
 * @param {{ onTick?: (payload:any)=>void, onEnd?:()=>void, onError?: (err:any)=>void }} handlers
 * @returns {{ close: ()=>void, es: EventSource }}
 */
export function startReplayStream(buildingId, handlers = {}) {
  if (!buildingId) throw new Error('buildingId is required');

  const url = `${API_BASE_URL}/stream/replay?buildingId=${encodeURIComponent(buildingId)}`;
  const es = new EventSource(url, { withCredentials: false });

  es.addEventListener('replay_tick', (e) => {
    try {
      const payload = JSON.parse(e.data);
      // payload 예시:
      // {
      //   building_id, ts, actual_kwh, predicted_kwh,
      //   weather_used: { temperature, humidity, wind_speed, precipitation },
      //   peak: { is_peak, prob }
      // }
      handlers.onTick?.(payload);
    } catch (err) {
      handlers.onError?.(err);
    }
  });

  es.addEventListener('end', () => {
    handlers.onEnd?.();
    es.close();
  });

  es.addEventListener('error', (err) => {
    handlers.onError?.(err);
    // 네트워크 에러 등에서 자동 재시도는 EventSource가 해줌.
  });

  return {
    es,
    close: () => es.close(),
  };
}
