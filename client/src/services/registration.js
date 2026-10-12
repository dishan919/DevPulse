export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Enter your email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password.trim()) errors.password = 'Enter a password.';
  return errors;
}
export function validateRegistration(values) {
  const errors = {};
  if (!values.name.trim() || values.name.trim().length > 100 || (/[<>]/.test(values.name) || [...values.name].some(char => char.charCodeAt(0) < 32))) errors.name = 'Enter your full name (1–100 characters, no markup).';
  Object.assign(errors, validateLogin(values));
  if (!errors.password && (values.password.length < 12 || !/[a-z]/.test(values.password) || !/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password) || new TextEncoder().encode(values.password).length > 72)) errors.password = 'Use 12–72 bytes with uppercase, lowercase and a number.';
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords must match.';
  return errors;
}

