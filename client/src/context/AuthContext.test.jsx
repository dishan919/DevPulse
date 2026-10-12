// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { AuthGate } from '../components/AuthGate.jsx';
import { SwapForm } from '../components/SwapForm.jsx';
const data = { user: { id: 'u', name: 'John' }, workspaces: [{ id: 'a', name: 'First' }, { id: 'b', name: 'Second' }] };
const response = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function Dashboard() { const auth = useAuth(); return <><p>Dashboard {auth.user.name} {auth.currentWorkspace?.name}</p><button onClick={() => auth.switchWorkspace('b')}>Switch</button><button onClick={auth.logout}>Logout</button></>; }
function mount(path = '/app') { return render(<MemoryRouter initialEntries={[path]}><AuthProvider><Routes><Route element={<AuthGate guest/>}><Route path="/login" element={<SwapForm isSignIn onModeChange={() => {}}/>}/><Route path="/register" element={<SwapForm isSignIn={false} onModeChange={() => {}}/>}/></Route><Route element={<AuthGate/>}><Route path="/app" element={<Dashboard/>}/><Route path="/app/dashboard" element={<Dashboard/>}/></Route></Routes></AuthProvider></MemoryRouter>); }
test('session restoration, authenticated route access, workspace switching and logout', async () => {
  const fetch = vi.fn().mockResolvedValueOnce(response(data)).mockResolvedValueOnce(response(null, 204)); vi.stubGlobal('fetch', fetch);
  mount('/login'); expect(screen.getByRole('status').textContent).toContain('Checking');
  await screen.findByText('Dashboard John First'); const user = userEvent.setup(); await user.click(screen.getByText('Switch')); expect(screen.getByText('Dashboard John Second')).toBeTruthy();
  await user.click(screen.getByText('Logout')); await screen.findByRole('heading', { name: 'Sign In' });
  expect(fetch.mock.calls[1][1].credentials).toBe('include');
});
test('guest protected redirect, login validation, failed and successful login', async () => {
  const fetch = vi.fn().mockResolvedValueOnce(response({ error: { message: 'Sign in' } }, 401)).mockResolvedValueOnce(response({ error: { message: 'Email or password is incorrect.' } }, 401)).mockResolvedValueOnce(response(data)); vi.stubGlobal('fetch', fetch);
  mount(); const user = userEvent.setup(); await screen.findByRole('heading', { name: 'Sign In' }); await user.click(screen.getByRole('button', { name: 'Sign In' })); expect(screen.getAllByRole('alert')).toHaveLength(2); expect(fetch).toHaveBeenCalledTimes(1);
  await user.type(screen.getByLabelText('Email'), 'john@example.com'); await user.type(screen.getByLabelText('Password'), 'SecurePassword123!');
  await user.click(screen.getByRole('button', { name: 'Sign In' })); await screen.findByText('Email or password is incorrect.');
  await user.click(screen.getByRole('button', { name: 'Sign In' })); await screen.findByText('Dashboard John First');
});
test('register validation and successful registration establishes workspace state', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({}, 401)).mockResolvedValueOnce(response(data)));
  mount('/register'); const user = userEvent.setup(); await screen.findByRole('heading', { name: 'Create your account' });
  await user.click(screen.getByRole('button', { name: 'Create Account' })); expect(screen.getAllByRole('alert')).toHaveLength(4);
  for (const [label, value] of [['Full Name', 'John'], ['Email', 'john@example.com'], ['Password', 'SecurePassword123!'], ['Confirm Password', 'wrong']]) await user.type(screen.getByLabelText(label), value);
  await user.click(screen.getByRole('button', { name: 'Create Account' })); expect(screen.getByText('Passwords must match.')).toBeTruthy();
  await user.clear(screen.getByLabelText('Confirm Password')); await user.type(screen.getByLabelText('Confirm Password'), 'SecurePassword123!'); await user.click(screen.getByRole('button', { name: 'Create Account' })); await screen.findByText('Dashboard John First');
});
test('session network failure shows retry without exposing protected content', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValueOnce(response(data))); mount(); await screen.findByRole('alert'); expect(screen.queryByText('Dashboard John First')).toBeNull(); await userEvent.click(screen.getByText('Retry session')); await waitFor(() => expect(screen.getByText('Dashboard John First')).toBeTruthy());
});
