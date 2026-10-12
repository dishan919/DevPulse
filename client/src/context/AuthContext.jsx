import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { apiGet, apiPost } from '../services/api.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [session, setSession] = useState({ user: null, workspaces: [] });
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const apply = useCallback(data => { setSession(data); setCurrentId(previous => data.workspaces.some(w => w.id === previous) ? previous : data.workspaces[0]?.id || null); setError(''); }, []);
  const refreshSession = useCallback(async () => {
    const id = ++generation.current;
    setLoading(true);
    try { const data = await apiGet('/auth/me'); if (id === generation.current) apply(data); }
    catch (err) { if (id === generation.current) { setSession({ user: null, workspaces: [] }); setCurrentId(null); setError(err.status === 401 ? '' : err.message); } }
    finally { if (id === generation.current) setLoading(false); }
  }, [apply]);
  useEffect(() => { const lifecycle = generation; let active = true; queueMicrotask(() => { if (active) void refreshSession(); }); return () => { active = false; lifecycle.current++; }; }, [refreshSession]);
  async function authorize(path, values) { generation.current++; const data = await apiPost(path, values); apply(data); setLoading(false); }
  async function logout() { await apiPost('/auth/logout', {}); generation.current++; setSession({ user: null, workspaces: [] }); setCurrentId(null); }
  function switchWorkspace(id) { if (session.workspaces.some(w => w.id === id)) setCurrentId(id); }
  return <AuthContext.Provider value={{ ...session, currentWorkspace: session.workspaces.find(w => w.id === currentId) || null, isAuthenticated: Boolean(session.user), isLoading, error, refreshSession, login: values => authorize('/auth/login', values), register: values => authorize('/auth/register', values), logout, switchWorkspace }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);


