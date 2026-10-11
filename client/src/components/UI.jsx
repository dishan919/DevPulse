import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight } from 'lucide-react';
export function PageHeading({ title, subtitle, action }) { return <div className="page-heading"><div><div className="eyebrow">YOUR OPERATIONS, AT A GLANCE</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>; }
export function EmptyState({ title, description, link, label }) { return <div className="empty-state"><span className="empty-icon"><Activity size={25} /></span><h3>{title}</h3><p>{description}</p>{link && <Link className="button small" to={link}>{label}<ArrowUpRight size={15}/></Link>}</div>; }
export function Panel({ title, subtitle, children, action, className = '' }) { return <section className={`panel ${className}`}><div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>; }
