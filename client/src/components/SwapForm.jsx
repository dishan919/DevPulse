import { useRef, useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { apiPost } from '../services/api.js';
import { validateRegistration } from '../services/registration.js';

const emptyForm = { name: '', email: '', password: '', confirmPassword: '' };
const fields = [
  ['name', 'Full Name', 'text', 'Your full name', 'name'],
  ['email', 'Email', 'email', 'you@example.com', 'email'],
  ['password', 'Password', 'password', 'Create a password', 'new-password'],
  ['confirmPassword', 'Confirm Password', 'password', 'Enter your password again', 'new-password'],
];

// Adapted from https://registry.watermelon.sh/r/swap-form.json.
// Keeps the inset card and controlled mode switch using DevPulse's native CSS.
export function SwapForm({ isSignIn, onModeChange }) {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const formRef = useRef(null);

  function changeMode() {
    if (submitting.current) return;
    setValues(emptyForm);
    setErrors({});
    setApiError('');
    setSuccess(false);
    onModeChange(!isSignIn);
  }

  async function submit(event) {
    event.preventDefault();
    if (isSignIn || submitting.current || success) return;
    const validation = validateRegistration(values);
    setErrors(validation);
    setApiError('');
    if (Object.keys(validation).length) {
      formRef.current?.querySelector(`[name="${Object.keys(validation)[0]}"]`)?.focus();
      return;
    }
    submitting.current = true;
    setLoading(true);
    try {
      await apiPost('/auth/register', {
        name: values.name.trim(), email: values.email.trim(), password: values.password,
      });
      setValues(emptyForm);
      setSuccess(true);
    } catch (error) {
      setApiError(error.message);
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return <section className="swap-form" aria-labelledby="auth-title">
    <div className="swap-form-panel">
      <p className="auth-eyebrow">WELCOME TO DEVPULSE</p>
      <h1 id="auth-title">{isSignIn ? 'Sign In' : 'Create your account'}</h1>
      <p className="auth-subtitle">{isSignIn ? 'Your services. One clear view.' : 'Start your journey to a healthier stack.'}</p>
      {isSignIn ? <div className="auth-coming-soon">
        <p>Sign In is coming next. Login is not available yet.</p>
        <button className="button auth-submit" type="button" disabled>Sign In — coming soon</button>
      </div> : success ? <div className="auth-success" role="status">
        <CheckCircle2 size={32} aria-hidden="true" />
        <h2>Account created successfully</h2>
        <p>Your registration is complete. Sign In will be available in the next update.</p>
      </div> : <form ref={formRef} className="auth-form" onSubmit={submit} noValidate aria-busy={loading}>
        {fields.map(([name, label, type, placeholder, autoComplete]) => <div className="auth-field" key={name}>
          <label htmlFor={`register-${name}`}>{label}</label>
          <input id={`register-${name}`} name={name} type={type} autoComplete={autoComplete}
            placeholder={placeholder} value={values[name]} required disabled={loading}
            aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined}
            onChange={event => {
              setValues(previous => ({ ...previous, [name]: event.target.value }));
              setErrors(previous => ({ ...previous, [name]: undefined }));
              setApiError('');
            }} />
          {errors[name] && <p className="auth-field-error" id={`${name}-error`} role="alert">{errors[name]}</p>}
        </div>)}
        {apiError && <p className="auth-api-error" role="alert">{apiError}</p>}
        <button className="button auth-submit" disabled={loading} type="submit">
          {loading ? 'Creating account...' : 'Create Account'}{!loading && <ArrowRight size={16} aria-hidden="true" />}
        </button>
        <span className="auth-loading" role="status">{loading ? 'Creating account...' : ''}</span>
      </form>}
    </div>
    <div className="swap-form-footer">
      <p>{isSignIn ? 'New to DevPulse?' : 'Already have an account?'}{' '}
        <button type="button" onClick={changeMode} disabled={loading}>{isSignIn ? 'Create Account' : 'Sign In'}</button>
      </p>
    </div>
  </section>;
}
