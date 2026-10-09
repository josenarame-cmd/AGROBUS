import { useEffect, useState, useCallback } from 'react';
import {
  Bell, BrainCircuit, HandCoins, Landmark, MapPin, RefreshCw, Sprout, Tractor, TrendingUp, Wheat,
} from 'lucide-react';
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
  totalFarmsHectares: number;
  uniqueCropsCount: number;
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <FarmerStatCard
              label="My farms"
              value={loading ? '…' : String(dashboard?.totalFarms ?? 0)}
              detail={loading ? '' : `${dashboard?.totalFarmsHectares ?? 0} hectares total`}
              icon={Tractor}
            />
            <FarmerStatCard
              label="Primary crops"
              value={loading ? '…' : String(dashboard?.uniqueCropsCount ?? 0)}
              detail="From your farm profiles"
              icon={Wheat}
              tone="green"
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
            <FarmerQuickAction to="/farmer/crops"        icon={Wheat}                 label="My crops"        detail="Manage crop cycles on your farms" />
            <FarmerQuickAction to="/farmer/activities"   icon={Sprout}                label="Farm activities" detail="Log and review crop work" />
            <FarmerQuickAction to="/farmer/loans"        icon={Landmark}              label="My loans"        detail="Track your credit applications" />
            <FarmerQuickAction to="/farmer/loans"        icon={HandCoins}             label="Request a loan"  detail="Apply for agricultural input credit" state={{ openForm: true }} />
            <FarmerQuickAction to="/farmer/repayments"   icon={HandCoins}             label="Repayments"      detail="See your payment history" />
            <FarmerQuickAction to="/farmer/soil-analysis" icon={MapPin}               label="Soil analysis"   detail="Review soil results for your farms" />
            <FarmerQuickAction to="/farmer/intelligence" icon={BrainCircuit}          label="Farm insights"   detail="Explore recommendations from your records" />
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

        {/* ── Farm profile snapshot ───────────────────────────────────────── */}
        <section>
          <FarmerSectionHeader
            title="Farm profile"
            description="A quick snapshot of details linked to your farmer account."
            action={{ to: '/farmer/farms', label: 'View my farms' }}
          />
          <div className="farmer-surface grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <ProfileDetail label="Registered farms" value={loading ? '…' : String(dashboard?.totalFarms ?? 0)} />
            <ProfileDetail label="Total farm area" value={loading ? '…' : `${dashboard?.totalFarmsHectares ?? 0} ha`} />
            <ProfileDetail label="Primary crop" value={loading ? '…' : dashboard?.cropType || 'Not set'} />
            <ProfileDetail label="District" value={loading ? '…' : dashboard?.district || 'Not set'} />
          </div>
        </section>

      </div>
    </section>
  );
}

// ── Local sub-components ─────────────────────────────────────────────────────

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}
