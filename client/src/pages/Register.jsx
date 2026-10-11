import { useState } from 'react';
import { Brand } from '../components/Brand.jsx';
import { SwapForm } from '../components/SwapForm.jsx';
import '../styles/auth.css';

export function Register() {
  const [isSignIn, setIsSignIn] = useState(false);
  return <main className="auth-page"><Brand />
    <SwapForm isSignIn={isSignIn} onModeChange={setIsSignIn} />
    <p className="auth-footnote">Your stack deserves a healthy pulse.</p>
  </main>;
}
