import { AuthGate } from './components/AuthGate.jsx';
import { Routes, Route, Link } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Landing } from './pages/Landing.jsx';
import { FoundationPage } from './pages/FoundationPage.jsx';
import { Register } from './pages/Register.jsx';
export function App() { return <Routes><Route path="/" element={<Landing/>}/>
<Route element={<AuthGate guest/>}><Route path="/login" element={<Register/>}/>
<Route path="/register" element={<Register />} /></Route><Route element={<AuthGate/>}>
<Route path="/app" element={<AppLayout/>}>
<Route index element={<Dashboard/>}/><Route path="dashboard" element={<Dashboard/>}/>{['monitors', 'monitors/new', 'incidents', 'analytics', 'team', 'settings'].map(path => <Route key={path} path={path} element={<FoundationPage/>}/>)}</Route></Route><Route path="*" element={<div className="not-found"><h1>Page not found</h1><p>This address is not part of the DevPulse foundation.</p><Link className="button" to="/">Return home</Link></div>}/></Routes>; }

