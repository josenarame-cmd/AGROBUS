import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, CheckCircle, XCircle, AlertTriangle, Truck, Activity, Check, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { PageHeader } from '../components/ui/page-header';
import { PageSpinner } from '../components/ui/spinner';
import { fmtDateTime } from '../lib/utils';

interface Notification {
  id: number; title: string; message: string; type: string;
  recipientId?: number; recipientRole?: string; read: boolean; createdAt: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  LOAN_APPROVAL:      <CheckCircle  className="h-5 w-5 text-green-500" />,
  LOAN_REJECTION:     <XCircle      className="h-5 w-5 text-red-500" />,
  LOW_STOCK:          <AlertTriangle className="h-5 w-5 text-amber-500" />,
  INPUT_DELIVERY:     <Truck        className="h-5 w-5 text-blue-500" />,
  REPAYMENT_REMINDER: <Bell         className="h-5 w-5 text-purple-500" />,
  SYSTEM:             <Activity     className="h-5 w-5 text-slate-400" />,
};

function bgClass(type: string, read: boolean) {
  if (read) return 'bg-white opacity-70 border-slate-100';
  const map: Record<string, string> = {
    LOAN_APPROVAL:  'bg-green-50 border-green-100',
    LOAN_REJECTION: 'bg-red-50 border-red-100',
    LOW_STOCK:      'bg-amber-50 border-amber-100',
    INPUT_DELIVERY: 'bg-blue-50 border-blue-100',
  };
  return map[type] ?? 'bg-slate-50 border-slate-100';
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [filter, setFilter]               = useState<'all' | 'unread'>('all');

  const load = useCallback(async (p = 0) => {
    setLoading(p === 0);
    try {
      const res = await notificationAPI.getAll({ page: p, size: 30 });
      const data = res.data;
      if (p === 0) setNotifications(data.content ?? []);
      else setNotifications(prev => [...prev, ...(data.content ?? [])]);
      setTotalPages(data.totalPages ?? 0);
      setPage(p);
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to load notifications'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(0); }, [load]);

  const markRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { toast.error('Failed to mark as read'); }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (!unread.length) { toast('All notifications are already read'); return; }
    try {
      await Promise.all(unread.map(n => notificationAPI.markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success(`Marked ${unread.length} notifications as read`);
    } catch { toast.error('Some notifications could not be updated'); }
  };

  const visible = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Notifications" description="System alerts, loan updates, and stock warnings" icon={Bell}>
        <div className="flex items-center gap-2">
          <button onClick={() => load(0)} className="rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </button>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead}>
              <Check className="h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Filter + unread badge */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {f}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <Badge variant="amber">{unreadCount} unread</Badge>
        )}
      </div>

      {loading ? <PageSpinner /> : (
        <div className="space-y-2.5">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16 text-center">
              <Bell className="mb-3 h-10 w-10 text-slate-200" />
              <p className="font-semibold text-slate-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : visible.map(n => (
            <div key={n.id}
              className={`flex items-start gap-4 rounded-2xl border p-4 transition-all ${bgClass(n.type, n.read)}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                {TYPE_ICON[n.type] ?? <Activity className="h-5 w-5 text-slate-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`font-semibold ${n.read ? 'text-slate-500' : 'text-slate-900'}`}>{n.title}</p>
                    <p className={`mt-0.5 text-sm leading-5 ${n.read ? 'text-slate-400' : 'text-slate-600'}`}>{n.message}</p>
                  </div>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} title="Mark as read"
                      className="shrink-0 rounded-xl p-1.5 hover:bg-white/80">
                      <Check className="h-4 w-4 text-green-600" />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium text-slate-500">
                    {n.type.replace(/_/g, ' ')}
                  </span>
                  {n.recipientRole && <Badge variant="default">{n.recipientRole}</Badge>}
                  <span className="text-xs text-slate-400">{fmtDateTime(n.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {!loading && page < totalPages - 1 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => load(page + 1)}>Load more</Button>
        </div>
      )}
    </div>
  );
}
