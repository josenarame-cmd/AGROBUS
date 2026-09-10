import { useEffect, useState, useCallback } from 'react';
import {
  ArrowRight, BarChart3, Bell, HandCoins, Landmark, MessageCircleQuestion,
  Package, RefreshCw, Sprout, Store, Tractor, TrendingUp, Wheat,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { farmerSelfAPI } from '../services/api';
import {
  FarmerEmptyState, FarmerPageHeader, FarmerQuickAction,
  FarmerSectionHeader, FarmerStatCard,
} from '../components/farmer/FarmerUi';

// ── Types ────────────────────────────────────────────────────────────────────

interface FarmerDashboard {
  farmerId: number;
  fullName: string;
  creditScore: number;
  district: string;
  cropType: string;
  totalLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  deliveredLoans: number;
  repaidLoans: number;
  rejectedLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  outstandingBalance: number;
  totalFarms: number;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency', currency: 'RWF', maximumFractionDigits: 0,
  }).format(n ?? 0);
}

function creditColor(s: number) {
  return s >= 700 ? 'text-green-600' : s >= 500 ? 'text-amber-600' : 'text-red-600';
}

function creditLabel(s: number) {
  return s >= 700 ? 'Excellent' : s >= 600 ? 'Good' : s >= 500 ? 'Fair' : 'Low';
}

function creditTone(s: number): 'green' | 'gold' | 'blue' | 'slate' {
  return s >= 700 ? 'green' : s >= 500 ? 'gold' : 'slate';
}

// ── Component ────────────────────────────────────────────────────────────────

export default function FarmerHomePage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<FarmerDashboard | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, notifRes] = await Promise.all([
        farmerSelfAPI.getDashboard(),
        farmerSelfAPI.getMyNotifications(),
      ]);
      setDashboard(dashRes.data);
      setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Could not load your dashboard. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const firstName = user?.fullName?.split(' ')[0] ?? 'Farmer';
  const activeLoans = (dashboard?.approvedLoans ?? 0) + (dashboard?.deliveredLoans ?? 0);

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="Farmer command center"
        title={`Welcome, ${firstName}`}
        description="Your personal overview — loans, repayments, farms, and notifications in one place."
        icon={Sprout}
      />

      {/* Error banner */}
      {error && !loading && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <span className="flex-1">{error}</span>
          <button
            onClick={load}
            className="flex shrink-0 items-center gap-1.5 font-semibold hover:underline"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}

      <div className="space-y-8">

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <section>
          <FarmerSectionHeader title="Your farm at a glance" description="Live figures from your account." />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <FarmerStatCard
              label="My farms"
              value={loading ? '…' : String(dashboard?.totalFarms ?? 0)}
              detail="Registered farm plots"
              icon={Tractor}
            />
            <FarmerStatCard
              label="Active loans"
              value={loading ? '…' : String(activeLoans)}
              detail={loading ? '' : `${dashboard?.pendingLoans ?? 0} pending approval`}
              icon={Landmark}
              tone="gold"
            />
            <FarmerStatCard
              label="Outstanding balance"
              value={loading ? '…' : fmt(dashboard?.outstandingBalance ?? 0)}
              detail={loading ? '' : `${fmt(dashboard?.totalRepaid ?? 0)} repaid`}
              icon={HandCoins}
              tone="blue"
            />
            <FarmerStatCard
              label="Credit score"
              value={loading ? '…' : String(dashboard?.creditScore ?? '—')}
              detail={loading ? '' : creditLabel(dashboard?.creditScore ?? 500)}
              icon={TrendingUp}
              tone={loading ? 'slate' : creditTone(dashboard?.creditScore ?? 500)}
            />
          </div>
        </section>

        {/* ── Credit score bar ────────────────────────────────────────────── */}
        {!loading && dashboard && (
          <section className="farmer-surface px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Credit score</p>
                <p className="mt-0.5 text-xs text-slate-500">Range: 300 (low) – 850 (excellent). Improves with on-time repayments.</p>
              </div>
              <span className={`text-2xl font-bold tabular-nums ${creditColor(dashboard.creditScore)}`}>
                {dashboard.creditScore}
                <span className="ml-2 text-sm font-normal text-slate-500">{creditLabel(dashboard.creditScore)}</span>
              </span>
            </div>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  dashboard.creditScore >= 700 ? 'bg-green-500'
                  : dashboard.creditScore >= 500 ? 'bg-amber-400'
                  : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, ((dashboard.creditScore - 300) / 550) * 100)}%` }}
              />
            </div>
          </section>
        )}

        {/* ── Quick actions ────────────────────────────────────────────────── */}
        <section className="dashboard-band">
          <FarmerSectionHeader title="What would you like to do?" description="Shortcuts into your everyday farm work." />
          <div className="dashboard-actions-grid">
            <FarmerQuickAction to="/farmer/farms"        icon={Tractor}               label="My farms"        detail="View and manage your farms" />
            <FarmerQuickAction to="/farmer/loans"        icon={Landmark}              label="My loans"        detail="Track your credit applications" />
            <FarmerQuickAction to="/farmer/repayments"   icon={HandCoins}             label="Repayments"      detail="See your payment history" />
            <FarmerQuickAction to="/farmer/marketplace"  icon={Store}                 label="Buy inputs"      detail="Find agricultural supplies" />
            <FarmerQuickAction to="/farmer/ask-expert"   icon={MessageCircleQuestion} label="Ask an expert"   detail="Get practical guidance" />
            <FarmerQuickAction
              to="/farmer/notifications"
              icon={Bell}
              label="Notifications"
              detail={loading ? '…' : `${notifications.length} unread`}
            />
          </div>
        </section>

        {/* ── Finance summary ──────────────────────────────────────────────── */}
        {!loading && dashboard && (
          <section>
            <FarmerSectionHeader
              title="Finance summary"
              description="Your borrowing and repayment at a glance."
              action={{ to: '/farmer/loans', label: 'View all loans' }}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Total borrowed', value: fmt(dashboard.totalBorrowed),       color: 'text-slate-900' },
                { label: 'Total repaid',   value: fmt(dashboard.totalRepaid),         color: 'text-green-600' },
                { label: 'Outstanding',    value: fmt(dashboard.outstandingBalance),  color: dashboard.outstandingBalance > 0 ? 'text-amber-600' : 'text-slate-900' },
              ].map(({ label, value, color }) => (
                <div key={label} className="farmer-surface px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Loan status breakdown ────────────────────────────────────────── */}
        {!loading && dashboard && dashboard.totalLoans > 0 && (
          <section>
            <FarmerSectionHeader
              title="Loan status breakdown"
              action={{ to: '/farmer/loans', label: 'All loans' }}
            />
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                { label: 'Pending',   count: dashboard.pendingLoans,   cls: 'bg-amber-100 text-amber-700' },
                { label: 'Approved',  count: dashboard.approvedLoans,  cls: 'bg-blue-100 text-blue-700' },
                { label: 'Delivered', count: dashboard.deliveredLoans, cls: 'bg-purple-100 text-purple-700' },
                { label: 'Repaid',    count: dashboard.repaidLoans,    cls: 'bg-green-100 text-green-700' },
                { label: 'Rejected',  count: dashboard.rejectedLoans,  cls: 'bg-red-100 text-red-700' },
              ].map(({ label, count, cls }) => (
                <div key={label} className={`rounded-xl px-4 py-3 text-center ${cls}`}>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="mt-1 text-xs font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Notifications preview ────────────────────────────────────────── */}
        <section>
          <FarmerSectionHeader
            title="Recent notifications"
            description="Unread updates from your account."
            action={{ to: '/farmer/notifications', label: 'View all' }}
          />
          <div className="farmer-surface overflow-hidden">
            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <FarmerEmptyState
                icon={Bell}
                title="No unread notifications"
                description="Loan updates, repayment reminders, and system alerts will appear here."
                compact
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50">
                    <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{n.message}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(n.createdAt).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Workspace panels (stubs) ─────────────────────────────────────── */}
        <section>
          <FarmerSectionHeader title="Your workspace" description="More features coming soon." />
          <div className="dashboard-activity-grid">
            <WorkspacePanel
              title="Crop management"
              description="Track crop records and their lifecycle across your farms."
              icon={Wheat}
              to="/farmer/crops"
              label="Go to crops"
            />
            <WorkspacePanel
              title="Marketplace"
              description="Browse and order agricultural inputs from connected suppliers."
              icon={Package}
              to="/farmer/marketplace"
              label="Open marketplace"
            />
          </div>
        </section>

      </div>
    </section>
  );
}

// ── Local sub-components ─────────────────────────────────────────────────────

function WorkspacePanel({
  title, description, icon: Icon, to, label,
}: {
  title: string; description: string; icon: typeof Wheat; to: string; label: string;
}) {
  return (
    <section className="farmer-surface overflow-hidden">
      <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
        <div className="dashboard-panel-icon"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <h3 className="farmer-section-title">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">
        <p className="text-sm text-slate-400">This section will be connected to live data in a future release.</p>
        <Link to={to} className="farmer-inline-action mt-3">
          {label} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
