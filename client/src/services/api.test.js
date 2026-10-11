import { test, expect, vi, afterEach } from 'vitest';
import { apiGet } from './api.js';
afterEach(() => vi.unstubAllGlobals());
test('returns backend data without substituting demo values', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ready: true }) }));
  expect(await apiGet('/health/ready')).toEqual({ ready: true });
});
test('surfaces safe backend errors', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: { message: 'Not ready' } }) }));
  await expect(apiGet('/health/ready')).rejects.toThrow('Not ready');
});
test('explains connection failures', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
  await expect(apiGet('/health')).rejects.toThrow('Cannot reach the API');
});
test('preserves cancellation', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));
  await expect(apiGet('/health')).rejects.toMatchObject({ name: 'AbortError' });
});
