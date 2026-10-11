const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
export async function apiPost(path, body, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method: 'POST', signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot reach the API. Start the server and check VITE_API_URL.');
  }
  let data;
  try { data = await response.json(); }
  catch { throw new Error('The API returned an unexpected response. Please try again.'); }
  if (!response.ok) throw new Error(data?.error?.message || data?.message || 'Registration failed. Please try again.');
  return data;
}
export async function apiGet(path, { signal } = {}) {
  let response;
  try { response = await fetch(`${base}${path}`, { signal, headers: { Accept: 'application/json' } }); }
  catch (error) { if (error.name === 'AbortError') throw error; throw new Error('Cannot reach the API. Start the server and check VITE_API_URL.'); }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'The API is not ready yet. Check the database connection.');
  return data;
}
