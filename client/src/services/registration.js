export function validateRegistration({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Enter your full name.';
  if (!email.trim()) errors.email = 'Enter your email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password.trim()) errors.password = 'Enter a password.';
  if (!confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords must match.';
  return errors;
}
