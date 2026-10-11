import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { SwapForm } from './SwapForm.jsx';

test('register mode exposes all four labeled fields without claiming success', () => {
  const html = renderToStaticMarkup(<SwapForm isSignIn={false} onModeChange={() => {}} />);
  for (const label of ['Full Name', 'Email', 'Password', 'Confirm Password', 'Create Account']) expect(html).toContain(label);
  expect(html).not.toContain('Account created successfully');
  expect(html).not.toContain('Continue with Google');
});
test('sign in mode clearly indicates unavailable login with a disabled button', () => {
  const html = renderToStaticMarkup(<SwapForm isSignIn onModeChange={() => {}} />);
  expect(html).toContain('Login is not available yet');
  expect(html).toContain('disabled=""');
  expect(html).not.toContain('<form');
});
