import { useNavigate, useLocation } from 'react-router-dom';
import { Brand } from '../components/Brand.jsx';
import { SwapForm } from '../components/SwapForm.jsx';
import '../styles/auth.css';
export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  return <main className="auth-page"><Brand/><SwapForm key={location.pathname} isSignIn={location.pathname === '/login'} onModeChange={signIn => navigate(signIn ? '/login' : '/register')}/><p className="auth-footnote">Your stack deserves a healthy pulse.</p></main>;
}
