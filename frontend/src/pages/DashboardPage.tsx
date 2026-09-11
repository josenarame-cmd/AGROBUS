import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../services/api';
import {
  Users, FileText, TrendingUp, Package, CheckCircle2, AlertTriangle,
  Truck, Activity, XCircle, RefreshCw, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import { StatCard } from '../components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { PageSpinner } from '../components/ui/spinner';
import { fmt, fmtDateTime } from '../lib/utils';

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'];

function activityIcon(type: string) {
  const cls = 'h-4 w-4';
  switch (type) {
    case 'LOAN_APPROVAL':      return <CheckCircle2  className={`${cls} text-green-500`} />;
    case 'LOAN_REJECTION':     return <XCircle       className={`${cls} text-red-500`} />;
    case 'LOW_STOCK':          return <AlertTriangle className={`${cls} text-amber-500`} />;
    case 'INPUT_DELIVERY':     return <Truck         className={`${cls} text-blue-500`} />;
    default:                   return <Activity      className={`${cls} text-slate-400`} />;
  }
}

export default function DashboardPage() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res = await dashboardAPI.getData();
      setData(res.data);
    } catch {
      setError(true);
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageSpinner label="Loading dashboard…" />;

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Unable to load dashboard</h2>
      <p className="mt-1 text-sm text-slate-500">Check that the backend is running on port 8080.</p>
      <button onClick={load}
        className="mt-5 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 hover:bg-green-700">
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  );

  // safe arrays — guard against null from backend
  const loanTrends      = Array.isArray(data.loanTrends)       ? data.loanTrends      : [];
  const repayTrends     = Array.isArray(data.repaymentTrends)  ? data.repaymentTrends : [];
  const loansByStatus   = Array.isArray(data.loansByStatus)    ? data.loansByStatus   : [];
  const stockByCategory = Array.isArray(data.stockByCategory)  ? data.stockByCategory : [];
  const activities      = Array.isArray(data.recentActivities) ? data.recentActivities: [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Farmers"   value={data.totalFarmers?.toLocaleString() ?? 0}
          subtitle={`${data.activeFarmers ?? 0} active`}
          icon={Users} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard
          title="Active Loans"    value={((data.approvedLoans ?? 0) + (data.deliveredLoans ?? 0)).toLocaleString()}
          subtitle={`${data.pendingLoans ?? 0} pending`}
          icon={FileText} iconBg="bg-amber-100" iconColor="text-amber-600" />
        <StatCard
          title="Total Disbursed" value={fmt(data.totalDisbursed)}
          subtitle="All approved loans"
          icon={TrendingUp} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard
          title="Total Repaid"    value={fmt(data.totalRepaid)}
          subtitle={`Outstanding: ${fmt(data.outstandingBalance)}`}
          icon={CheckCircle2} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <StatCard
          title="Loans Repaid"    value={data.repaidLoans?.toLocaleString() ?? 0}
          subtitle={`${data.rejectedLoans ?? 0} rejected`}
          icon={CheckCircle2} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard
          title="Inventory Items" value={data.totalInputsDistributed?.toLocaleString() ?? 0}
          subtitle={data.lowStockItems > 0 ? `${data.lowStockItems} low stock ⚠` : 'Stock healthy'}
          icon={Package}
          iconBg={data.lowStockItems > 0 ? 'bg-red-100' : 'bg-teal-100'}
          iconColor={data.lowStockItems > 0 ? 'text-red-600' : 'text-teal-600'} />
      </div>

      {/* ── Charts row ───────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Loan Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Applications</CardTitle>
            <CardDescription>Monthly loan requests this year</CardDescription>
          </CardHeader>
          <CardContent>
            {loanTrends.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={loanTrends}>
                  <defs>
                    <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }} />
                  <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2.5} fill="url(#loanGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Loans by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Distribution</CardTitle>
            <CardDescription>Breakdown by current status</CardDescription>
          </CardHeader>
          <CardContent>
            {loansByStatus.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={loansByStatus} cx="50%" cy="50%" innerRadius={65} outerRadius={105}
                    paddingAngle={3} dataKey="count" nameKey="status">
                    {loansByStatus.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Repayment Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Repayment Collection</CardTitle>
            <CardDescription>Monthly repayments received this year</CardDescription>
          </CardHeader>
          <CardContent>
            {repayTrends.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-slate-400">No repayments yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={repayTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12}
                    tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                    formatter={(v: number) => [fmt(v), 'Amount']} />
                  <Bar dataKey="amount" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </div>
              <button onClick={load} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activities.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">No recent activity</div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {activities.slice(0, 8).map((a: any, i: number) => (
                  <li key={i} className="flex items-start gap-3 px-6 py-3.5">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50">
                      {activityIcon(a.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{a.title}</p>
                      <p className="truncate text-xs text-slate-500">{a.message}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{fmtDateTime(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Inventory by category ──────────────────────────────────────── */}
      {stockByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>Current stock levels across all input categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {stockByCategory.map((item: any) => (
                <div key={item.category}
                  className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 transition-colors hover:bg-green-50">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    item.category === 'SEEDS'       ? 'bg-green-100 text-green-600' :
                    item.category === 'FERTILIZERS' ? 'bg-blue-100 text-blue-600'  :
                    'bg-orange-100 text-orange-600'}`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.category}</p>
                    <p className="text-xl font-bold text-slate-900">{(item.quantity ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">units available</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Loan status summary pills ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Pending',   count: data.pendingLoans,   variant: 'amber'   as const },
              { label: 'Approved',  count: data.approvedLoans,  variant: 'blue'    as const },
              { label: 'Delivered', count: data.deliveredLoans, variant: 'purple'  as const },
              { label: 'Repaid',    count: data.repaidLoans,    variant: 'green'   as const },
              { label: 'Rejected',  count: data.rejectedLoans,  variant: 'red'     as const },
            ].map(({ label, count, variant }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <Badge variant={variant}>{label}</Badge>
                <span className="text-xl font-bold tabular-nums text-slate-900">{count ?? 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
