import { ArrowRight, CheckCircle2, CircleAlert, LucideIcon, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FarmerPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: { label: string; to: string };
}) {
  return (
    <header className="farmer-page-header">
      <div className="flex min-w-0 items-start gap-4">
        <div className="farmer-page-icon"><Icon className="h-6 w-6" /></div>
        <div className="min-w-0">
          <p className="farmer-eyebrow">{eyebrow}</p>
          <p className="farmer-page-description">{description}</p>
        </div>
      </div>
      {action && <Link to={action.to} className="farmer-primary-action"><span>{action.label}</span><ArrowRight className="h-4 w-4" /></Link>}
    </header>
  );
}

export function FarmerSectionHeader({ title, description, action }: { title: string; description?: string; action?: { label: string; to: string } }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="farmer-section-title">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <Link to={action.to} className="farmer-inline-action">{action.label}<ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}

export function FarmerStatCard({ label, value, detail, icon: Icon, tone = 'green' }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: 'green' | 'gold' | 'blue' | 'slate' }) {
  return (
    <article className="farmer-stat-card">
      <div className={`farmer-stat-icon farmer-stat-${tone}`}><Icon className="h-5 w-5" /></div>
      <div className="min-w-0">
        <p className="farmer-stat-label">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </div>
    </article>
  );
}

export function FarmerEmptyState({ icon: Icon, title, description, action, compact = false }: { icon: LucideIcon; title: string; description: string; action?: { label: string; to: string }; compact?: boolean }) {
  return (
    <div className={`farmer-empty-state ${compact ? 'py-10' : 'py-16'}`}>
      <div className="farmer-empty-icon"><Icon className="h-7 w-7" /></div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action && <Link to={action.to} className="farmer-primary-action mt-5">{action.label}<ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}

export function FarmerServiceState({ connected, retry }: { connected: boolean; retry?: () => void }) {
  return (
    <div className={`farmer-service-state ${connected ? 'farmer-service-connected' : 'farmer-service-pending'}`}>
      {connected ? <CheckCircle2 className="h-5 w-5" /> : <CircleAlert className="h-5 w-5" />}
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{connected ? 'Connected to AGROBUS data' : 'Service connection in progress'}</p>
        <p className="mt-1 text-sm leading-6 opacity-80">{connected ? 'Your authenticated records will appear here when available.' : 'This area stays empty until a farmer-scoped service is connected. No sample records are displayed.'}</p>
      </div>
      {retry && <button onClick={retry} className="farmer-icon-action" aria-label="Retry"><RefreshCw className="h-4 w-4" /></button>}
    </div>
  );
}

export function FarmerQuickAction({ to, label, icon: Icon, detail }: { to: string; label: string; icon: LucideIcon; detail: string }) {
  return (
    <Link to={to} className="farmer-quick-action">
      <div className="farmer-quick-icon"><Icon className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{label}</p><p className="mt-1 truncate text-xs text-slate-500">{detail}</p></div>
      <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
    </Link>
  );
}