import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { validateRegistration, validateLogin } from '../services/registration.js';
const empty = { name: '', email: '', password: '', confirmPassword: '' };
export function SwapForm({ isSignIn, onModeChange, authenticate }) {
  const auth = useAuth();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const busy = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    const validation = (isSignIn ? validateLogin : validateRegistration)(values);
    setErrors(validation); setApiError('');
    if (Object.keys(validation).length) return;
    busy.current = true; setLoading(true);
    try { await (authenticate || (isSignIn ? auth.login : auth.register))({ name: values.name.trim(), email: values.email.trim(), password: values.password }); }
    catch (error) { setApiError(error.message); }
    finally { busy.current = false; setLoading(false); }
  }
  const fields = isSignIn ? ['email', 'password'] : ['name', 'email', 'password', 'confirmPassword'];
  const labels = { name: 'Full Name', email: 'Email', password: 'Password', confirmPassword: 'Confirm Password' };
  return <section className="swap-form" aria-labelledby="auth-title"><div className="swap-form-panel"><p className="auth-eyebrow">WELCOME TO DEVPULSE</p><h1 id="auth-title">{isSignIn ? 'Sign In' : 'Create your account'}</h1><p className="auth-subtitle">{isSignIn ? 'Your services. One clear view.' : 'Use at least 12 characters with uppercase, lowercase and a number.'}</p><form className="auth-form" noValidate onSubmit={submit} aria-busy={loading}>{fields.map(name => <div className="auth-field" key={name}><label htmlFor={`auth-${name}`}>{labels[name]}</label><input id={`auth-${name}`} name={name} type={name === 'email' ? 'email' : name === 'name' || visible ? 'text' : 'password'} autoComplete={name === 'name' ? 'name' : name === 'email' ? 'email' : isSignIn ? 'current-password' : 'new-password'} required disabled={loading} value={values[name]} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={e => setValues({ ...values, [name]: e.target.value })}/>{errors[name] && <p className="auth-field-error" id={`${name}-error`} role="alert">{errors[name]}</p>}</div>)}<button type="button" className="text-link" onClick={() => setVisible(!visible)}>{visible ? 'Hide passwords' : 'Show passwords'}</button>{apiError && <p role="alert" className="auth-api-error">{apiError}</p>}<button className="button auth-submit" disabled={loading}>{loading ? 'Please wait…' : isSignIn ? 'Sign In' : 'Create Account'}</button></form></div><div className="swap-form-footer"><p>{isSignIn ? 'New to DevPulse?' : 'Already have an account?'} <button disabled={loading} onClick={() => onModeChange(!isSignIn)}>{isSignIn ? 'Create Account' : 'Sign In'}</button></p></div></section>;
}
