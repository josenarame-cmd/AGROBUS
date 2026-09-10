import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
  Users, FileText, CreditCard, Package, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Clock, XCircle, Truck, ArrowUpRight, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await dashboardAPI.getData();
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <h2 className="font-semibold text-red-900">Unable to load the operations dashboard.</h2>
        <p className="mt-1 text-sm text-red-700">Check the backend connection and try again.</p>
        <button onClick={fetchDashboard} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: 'Total Farmers', value: formatNumber(data.totalFarmers), sub: `${formatNumber(data.activeFarmers)} active`, icon: Users, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Active Loans', value: formatNumber(data.approvedLoans + data.deliveredLoans), sub: `${data.pendingLoans} pending`, icon: FileText, color: 'bg-amber-500', trend: '+8%' },
    { label: 'Total Disbursed', value: formatCurrency(data.totalDisbursed), sub: 'This year', icon: TrendingUp, color: 'bg-green-500', trend: '+23%' },
    { label: 'Total Repaid', value: formatCurrency(data.totalRepaid), sub: `Outstanding: ${formatCurrency(data.outstandingBalance)}`, icon: CreditCard, color: 'bg-purple-500', trend: '+15%' },
    { label: 'Repaid Loans', value: formatNumber(data.repaidLoans), sub: `${data.rejectedLoans} rejected`, icon: CheckCircle2, color: 'bg-emerald-500', trend: '+18%' },
    { label: 'Inventory Items', value: formatNumber(data.totalInputsDistributed), sub: `${data.lowStockItems} low stock`, icon: Package, color: data.lowStockItems > 0 ? 'bg-red-500' : 'bg-teal-500', trend: data.lowStockItems > 0 ? '⚠️' : '+5%' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'LOAN_APPROVAL': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'LOAN_REJECTION': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'LOW_STOCK': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'INPUT_DELIVERY': return <Truck className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card rounded-2xl p-5 group" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                {card.trend}
                {card.trend.includes('+') && <ArrowUpRight className="w-3 h-3" />}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Loan Trends</h3>
              <p className="text-sm text-gray-500">Monthly loan applications this year</p>
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">2026</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.loanTrends}>
              <defs>
                <linearGradient id="loanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2.5} fill="url(#loanGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Loans by Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Loan Distribution</h3>
              <p className="text-sm text-gray-500">Loans by current status</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.loansByStatus}
                cx="50%" cy="50%"
                innerRadius={70} outerRadius={110}
                paddingAngle={3}
                dataKey="count" nameKey="status"
              >
                {data.loansByStatus.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repayment Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue & Repayments</h3>
              <p className="text-sm text-gray-500">Monthly repayment collection</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.repaymentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
              />
              <Bar dataKey="amount" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {data.recentActivities?.slice(0, 5).map((activity: any, i: number) => (
              <div key={i} className="flex items-start gap-3 animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.message}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory by Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.stockByCategory?.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                item.category === 'SEEDS' ? 'bg-green-100 text-green-600' :
                item.category === 'FERTILIZERS' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
              }`}>
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.category}</p>
                <p className="text-xl font-bold text-gray-900">{formatNumber(item.quantity)}</p>
                <p className="text-xs text-gray-500">units available</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
