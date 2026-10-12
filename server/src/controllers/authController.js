import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import Membership from '../models/Membership.js';
import { validateAuth, fail } from '../validators/auth.js';
import { cookieName, cookieOptions } from '../middleware/auth.js';
export const safeUser = user => ({ id: String(user._id), name: user.name, email: user.email, createdAt: user.createdAt });
export async function sessionData(user) {
  const memberships = await Membership.find({ user: user._id }).populate('workspace');
  return { user: safeUser(user), workspaces: memberships.filter(m => m.workspace).map(m => ({ id: String(m.workspace._id), name: m.workspace.name, slug: m.workspace.slug, role: m.role })) };
}
export function authController({ jwtSecret, production }) {
  function issue(res, user) {
    if (!jwtSecret) throw fail(503, 'AUTH_UNAVAILABLE', 'Authentication is not configured.');
    const token = jwt.sign({ version: user.sessionVersion || 0 }, jwtSecret, { subject: String(user._id), expiresIn: '8h', algorithm: 'HS256', issuer: 'devpulse', audience: 'devpulse-browser' });
    res.cookie(cookieName, token, { ...cookieOptions(production), maxAge: 8 * 60 * 60 * 1000 });
  }
  return {
    register: async (req, res) => {
      const values = validateAuth(req.body, true);
      if (!jwtSecret) throw fail(503, 'AUTH_UNAVAILABLE', 'Authentication is not configured.');
      if (await User.exists({ email: values.email })) throw fail(409, 'DUPLICATE_EMAIL', 'An account with this email already exists.');
      const passwordHash = await bcrypt.hash(values.password, 12);
      let user;
      try {
        await mongoose.connection.transaction(async session => {
          [user] = await User.create([{ name: values.name, email: values.email, passwordHash }], { session });
          const [workspace] = await Workspace.create([{ name: `${values.name.split(' ')[0]}'s Workspace`, slug: `workspace-${user._id}`, createdBy: user._id }], { session });
          await Membership.create([{ user: user._id, workspace: workspace._id, role: 'owner' }], { session });
        });
      } catch (error) {
        if (error.code === 11000) throw fail(409, 'DUPLICATE_EMAIL', 'An account with this email already exists.');
        throw error;
      }
      const data = await sessionData(user);
      issue(res, user);
      res.status(201).json(data);
    },
    login: async (req, res) => {
      const values = validateAuth(req.body);
      const user = await User.findOne({ email: values.email }).select('+passwordHash');
      // Always perform a bcrypt comparison, including for nonexistent accounts.
      const valid = await bcrypt.compare(values.password, user?.passwordHash || '$2b$12$C6UzMDM.H6dfI/f/IKcEe.5F7XnrCpqJz5GLp7g0xyxzIhUhROF5K');
      if (!user || !valid) throw fail(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
      const data = await sessionData(user);
      issue(res, user);
      res.json(data);
    },
    me: async (req, res) => res.json(await sessionData(req.user)),
    logout: async (req, res) => {
      await User.updateOne({ _id: req.user._id }, { $inc: { sessionVersion: 1 } });
      res.clearCookie(cookieName, cookieOptions(production));
      res.status(204).end();
    },
  };
}
