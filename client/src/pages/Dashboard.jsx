import { Plus } from 'lucide-react';
import { PageHeading, Panel } from '../components/UI.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApiHealth } from '../hooks/useApiHealth.js';
export function Dashboard() {
  const { user, currentWorkspace } = useAuth();
  const health = useApiHealth();
  return <><PageHeading title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle={currentWorkspace?.name || 'No accessible workspace'} action={<button className="button" disabled title="Monitor CRUD is the next development stage"><Plus size={17}/>Add Monitor</button>}/><Panel title="Monitoring has not been configured yet" subtitle="Your account and workspace are ready"><p>Persistent monitor creation is the next implementation stage. No monitoring checks are running.</p></Panel><Panel title="System status" subtitle="Live API readiness"><p>{health.loading ? 'Checking API connection…' : health.data ? 'API and database connected' : health.error}</p><button className="button secondary" disabled={health.loading} onClick={health.retry}>Retry API connection</button></Panel></>;
}
