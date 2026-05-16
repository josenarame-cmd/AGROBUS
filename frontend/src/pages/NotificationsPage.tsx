import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, CheckCircle, XCircle, AlertTriangle, Truck, Activity, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll({ page: 0, size: 50 });
      setNotifications(res.data.content || []);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      toast.success('Marked as read');
    } catch { toast.error('Failed'); }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LOAN_APPROVAL': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'LOAN_REJECTION': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'LOW_STOCK': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'INPUT_DELIVERY': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'REPAYMENT_REMINDER': return <Bell className="w-5 h-5 text-purple-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'LOAN_APPROVAL': return 'bg-green-50 border-green-100';
      case 'LOAN_REJECTION': return 'bg-red-50 border-red-100';
      case 'LOW_STOCK': return 'bg-amber-50 border-amber-100';
      case 'INPUT_DELIVERY': return 'bg-blue-50 border-blue-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Notifications</h1><p className="text-sm text-gray-500 mt-1">Stay updated on platform activities</p></div>
        <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
          {notifications.filter(n => !n.read).length} unread
        </span>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm">You'll see updates here when there's activity</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${n.read ? 'bg-white border-gray-100 opacity-70' : getBg(n.type)}`}>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              {getIcon(n.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={`text-sm font-semibold ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</h3>
                  <p className={`text-sm mt-0.5 ${n.read ? 'text-gray-400' : 'text-gray-600'}`}>{n.message}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markAsRead(n.id)} className="p-2 hover:bg-white/80 rounded-xl flex-shrink-0" title="Mark as read">
                    <Check className="w-4 h-4 text-green-600" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${n.read ? 'bg-gray-100 text-gray-500' : 'bg-white/60 text-gray-600'}`}>{n.type?.replace(/_/g, ' ')}</span>
                <span className="text-xs text-gray-400">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
