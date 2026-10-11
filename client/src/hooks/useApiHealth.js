import { useEffect, useState } from 'react';
import { apiGet } from '../services/api.js';
export function useApiHealth() {
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([apiGet('/health', { signal: controller.signal }), apiGet('/health/ready', { signal: controller.signal })])
      .then(([health, readiness]) => setState({ loading: false, error: '', data: { ...health, ...readiness } }))
      .catch(error => { if (!controller.signal.aborted) setState({ loading: false, error: error.message, data: null }); });
    return () => controller.abort();
  }, [attempt]);
  return { ...state, retry: () => { setState({ loading: true, error: '', data: null }); setAttempt(a => a + 1); } };
}
