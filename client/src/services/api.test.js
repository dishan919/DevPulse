import { test, expect, vi, afterEach } from 'vitest';
import { apiGet, apiPost } from './api.js';
afterEach(() => vi.unstubAllGlobals());
test('posts registration JSON to the existing endpoint', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: 'Account created successfully' }) });
  vi.stubGlobal('fetch', fetch);
  const body = { name: 'Test User', email: 'test@example.com', password: 'test-password' };
  expect(await apiPost('/auth/register', body)).toEqual({ message: 'Account created successfully' });
  expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/auth/register', expect.objectContaining({ method: 'POST', body: JSON.stringify(body), headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }));
});
test.each([
  { message: 'An account with this email already exists' },
  { error: { message: 'Too many requests' } },
])('preserves registration backend errors: %j', async data => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => data }));
  await expect(apiPost('/auth/register', {})).rejects.toThrow(data.message || data.error.message);
});
test('registration network failures cannot produce success', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
  await expect(apiPost('/auth/register', {})).rejects.toThrow('Cannot reach the API');
});
test('registration handles non-JSON responses', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => { throw new SyntaxError(); } }));
  await expect(apiPost('/auth/register', {})).rejects.toThrow('unexpected response');
});
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
