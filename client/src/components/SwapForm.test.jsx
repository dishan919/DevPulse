import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { SwapForm } from './SwapForm.jsx';
test('register mode exposes four labeled fields without claiming success', () => {
  const html = renderToStaticMarkup(<SwapForm isSignIn={false} onModeChange={() => {}}/>);
  for (const label of ['Full Name', 'Email', 'Password', 'Confirm Password', 'Create Account']) expect(html).toContain(label);
  expect(html).not.toContain('Account created successfully'); expect(html).not.toContain('Continue with Google');
});
test('sign in exposes a working login form', () => {
  const html = renderToStaticMarkup(<SwapForm isSignIn onModeChange={() => {}}/>);
  expect(html).toContain('<form'); expect(html).toContain('current-password'); expect(html).not.toContain('Confirm Password'); expect(html).not.toContain('coming soon');
});
