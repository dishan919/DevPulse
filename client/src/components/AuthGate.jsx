import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
export function AuthGate({ guest = false }) {
  const auth = useAuth();
  if (auth.isLoading) return <main className="auth-page" role="status">Checking your session…</main>;
  if (auth.error) return <main className="auth-page"><p role="alert">{auth.error}</p><button className="button" onClick={auth.refreshSession}>Retry session</button></main>;
  if (guest && auth.isAuthenticated) return <Navigate to="/app/dashboard" replace/>;
  if (!guest && !auth.isAuthenticated) return <Navigate to="/login" replace/>;
  return <Outlet/>;
}
