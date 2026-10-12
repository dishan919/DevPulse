const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try { response = await fetch(`${base}${path}`, { method, signal, credentials: 'include', headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }); }
  catch (error) { if (error.name === 'AbortError') throw error; throw new Error('Cannot reach the API. Start the server and check VITE_API_URL.'); }
  if (response.status === 204) return null;
  let data;
  try { data = await response.json(); } catch { throw new Error('The API returned an unexpected response. Please try again.'); }
  if (!response.ok) throw Object.assign(new Error(data?.error?.message || data?.message || 'Request failed. Please try again.'), { status: response.status });
  return data;
}
export const apiPost = (path, body, options = {}) => request(path, { ...options, method: 'POST', body });
export const apiGet = (path, options) => request(path, options);
