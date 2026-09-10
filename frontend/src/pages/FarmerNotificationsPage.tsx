import { useEffect, useState, useCallback } from 'react';
import { Activity, Bell, Check, CheckCircle, RefreshCw, Truck, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { farmerSelfAPI, notificationAPI } from '../services/api';
import { FarmerEmptyState, FarmerPageHeader, FarmerSectionHeader } from '../components/farmer/FarmerUi';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

function getIcon(type: string) {
  switch (type) {
    case 'LOAN_APPROVAL':      return <CheckCircle  className="h-5 w-5 text-green-500" />;
    case 'LOAN_REJECTION':     return <XCircle      className="h-5 w-5 text-red-500" />;
    case 'LOW_STOCK':          return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'INPUT_DELIVERY':     return <Truck        className="h-5 w-5 text-blue-500" />;
    case 'REPAYMENT_REMINDER': return <Bell         className="h-5 w-5 text-purple-500" />;
    default:                   return <Activity     className="h-5 w-5 text-slate-400" />;
  }
}

function bgClass(type: string, read: boolean) {
  if (read) return 'bg-white opacity-70';
  switch (type) {
    case 'LOAN_APPROVAL':  return 'bg-green-50 border-green-100';
    case 'LOAN_REJECTION': return 'bg-red-50 border-red-100';
    case 'LOW_STOCK':      return 'bg-amber-50 border-amber-100';
    case 'INPUT_DELIVERY': return 'bg-blue-50 border-blue-100';
    default:               return 'bg-slate-50 border-slate-100';
  }
}

export default function FarmerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [showAll, setShowAll]             = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load unread only initially; 'showAll' loads the full paginated list
      const res = showAll
        ? await farmerSelfAPI.getAllMyNotifications({ page: 0, size: 50 })
        : await farmerSelfAPI.getMyNotifications();
      const data = showAll ? (res.data?.content ?? res.data) : res.data;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, [showAll]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      toast.success('Marked as read');
    } catch {
      toast.error('Could not mark as read');
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (!unread.length) return;
    try {
      await Promise.all(unread.map(n => notificationAPI.markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Some notifications could not be updated');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="Services"
        title="Notifications"
        description="Your loan updates, repayment reminders, and system alerts."
        icon={Bell}
      />

      {/* Error */}
      {error && !loading && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <span className="flex-1">{error}</span>
          <button onClick={load} className="flex items-center gap-1.5 font-semibold hover:underline">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {unreadCount} unread
          </span>
          <button
            onClick={() => setShowAll(v => !v)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            {showAll ? 'Unread only' : 'Show all'}
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <Check className="h-4 w-4 text-green-600" /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className="farmer-surface">
            <FarmerEmptyState
              icon={Bell}
              title="No notifications"
              description={showAll ? 'You have no notifications yet.' : 'All caught up — no unread notifications.'}
              compact
            />
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-4 rounded-2xl border p-4 transition-all ${bgClass(n.type, n.read)}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                {getIcon(n.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-semibold ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                    <p className={`mt-0.5 text-sm leading-5 ${n.read ? 'text-slate-400' : 'text-slate-600'}`}>{n.message}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      title="Mark as read"
                      className="shrink-0 rounded-xl p-2 hover:bg-white/80"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${n.read ? 'bg-slate-100 text-slate-500' : 'bg-white/60 text-slate-600'}`}>
                    {n.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
