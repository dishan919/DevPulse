import { expect, test } from 'vitest';
import { validateRegistration } from './registration.js';

test('requires all fields, including a nonblank name and password', () => {
  expect(Object.keys(validateRegistration({ name: ' ', email: '', password: ' ', confirmPassword: '' }))).toEqual(['name', 'email', 'password', 'confirmPassword']);
});
test('rejects malformed email and mismatched passwords', () => {
  expect(validateRegistration({ name: 'Test', email: 'invalid@', password: 'secret', confirmPassword: 'different' })).toEqual({ email: 'Enter a valid email address.', confirmPassword: 'Passwords must match.' });
});
test('accepts complete matching fields with trimmed name and email', () => {
  expect(validateRegistration({ name: ' Test ', email: ' test@example.com ', password: 'secret', confirmPassword: 'secret' })).toEqual({});
});
