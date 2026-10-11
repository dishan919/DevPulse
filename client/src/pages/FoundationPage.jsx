import { Link, useLocation } from 'react-router-dom';
import { PageHeading, Panel, EmptyState } from '../components/UI.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
const pages = {
  monitors: ['Monitors', 'Your endpoints, organized and observable.', 'Monitoring is the next milestone', 'Persistent monitor creation will follow authentication and workspace authorization.'],
  incidents: ['Incidents', 'Follow every interruption from detection to recovery.', 'No incident engine connected yet', 'Threshold detection, automatic recovery, and preserved incident history are planned for the worker stage.'],
  analytics: ['Analytics', 'Understand the health and performance of your services.', 'Waiting for real check data', 'Charts will use stored monitoring checks. No synthetic statistics are shown in the workspace.'],
  team: ['Team', 'A shared workspace for a healthier stack.', 'Workspace access comes next', 'Owner, member, and viewer permissions will be enforced by the API before team management is enabled.'],
};
export function FoundationPage() {
  const location = useLocation();
  const key = location.pathname.split('/')[2];
  const { theme, toggleTheme } = useTheme();
  if (key === 'settings') return <><PageHeading title="Settings" subtitle="Configure your experience and inspect the foundation."/><Panel title="Appearance" subtitle="Stored locally on this browser"><div className="setting-row"><div><strong>Color theme</strong><p>Current preference: {theme}</p></div><button className="button secondary" onClick={toggleTheme}>Switch to {theme === 'light' ? 'dark' : 'light'}</button></div></Panel><Panel title="Development setup" subtitle="Run the services locally"><div className="setup-content"><p>Copy <code>.env.example</code> to <code>.env</code>, install dependencies, and start MongoDB. Then run the API and frontend in separate terminals.</p><pre>npm install{'\n'}npm run dev:server{'\n'}npm run dev:client</pre><p>The API provides <code>/api/health</code> and <code>/api/health/ready</code>. Redis, BullMQ, JWT authentication, and Socket.IO are reserved for the next stages.</p></div></Panel></>;
  const adding = location.pathname.endsWith('/new');
  const [title, subtitle, emptyTitle, description] = pages[key] || ['Coming next', 'The architecture is ready for its next stage.', 'This feature is not implemented yet', 'Return to the foundation dashboard to inspect API connectivity.'];
  return <><PageHeading title={adding ? 'Add monitor' : title} subtitle={subtitle}/><Panel title={adding ? 'Monitor setup' : title}><EmptyState title={adding ? 'Monitor creation is not enabled yet' : emptyTitle} description={description} link="/app/dashboard" label="Back to dashboard"/></Panel></>;
}
export function AuthFoundation() { return <div className="auth-foundation"><Panel title="Authentication comes next" subtitle="Foundation stage"><EmptyState title="Your account should be secure from day one" description="Registration, bcrypt password hashing, JWT sessions, and protected workspaces will be implemented together in the next stage." link="/app/dashboard" label="Explore the foundation"/><Link className="text-link" to="/">Back to DevPulse</Link></Panel></div>; }
