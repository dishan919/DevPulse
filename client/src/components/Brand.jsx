import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
export function Brand() { return <Link className="brand" to="/" aria-label="DevPulse home"><span className="brand-icon"><Zap size={21} fill="currentColor" /></span>DevPulse<span className="brand-dot">.</span></Link>; }
