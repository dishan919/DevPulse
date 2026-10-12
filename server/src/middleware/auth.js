import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Membership from '../models/Membership.js';
import { fail } from '../validators/auth.js';
export const cookieName = 'devpulse_session';
export const cookieOptions = production => ({ httpOnly: true, secure: production, sameSite: 'lax', path: '/api' });
export function authenticate({ jwtSecret }) {
  return async (req, _res, next) => {
    try {
      const raw = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
      if (!raw || !jwtSecret) throw new Error();
      const payload = jwt.verify(raw, jwtSecret, { algorithms: ['HS256'], issuer: 'devpulse', audience: 'devpulse-browser' });
      if (!mongoose.isObjectIdOrHexString(payload.sub)) throw new Error();
      req.user = await User.findById(payload.sub);
      if (!req.user || payload.version !== (req.user.sessionVersion || 0)) throw new Error();
      next();
    } catch { next(fail(401, 'UNAUTHENTICATED', 'Please sign in to continue.')); }
  };
}
export async function requireWorkspaceMembership(req, _res, next) {
  try {
    if (!req.user) throw fail(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
    if (!mongoose.isObjectIdOrHexString(req.params.workspaceId)) throw fail(400, 'VALIDATION_ERROR', 'Invalid workspace identifier.');
    req.membership = await Membership.findOne({ user: req.user._id, workspace: req.params.workspaceId }).populate('workspace');
    if (!req.membership?.workspace) throw fail(403, 'FORBIDDEN', 'Workspace access denied.');
    next();
  } catch (error) { next(error); }
}
export function requireRole(...roles) { return (req, _res, next) => next(roles.includes(req.membership?.role) ? undefined : fail(403, 'FORBIDDEN', 'Your role does not permit this action.')); }
