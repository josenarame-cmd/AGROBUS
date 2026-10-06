import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, Package, UserCheck, CreditCard,
  Bell, Smartphone, LogOut, Menu, X, ChevronDown, ChevronRight, Sprout,
  Sun, Moon, Tractor, Wheat, ClipboardList, Radio, ShoppingBag, Store,
  BadgeDollarSign, MessageCircleQuestion, Lightbulb, Landmark, BarChart3,
  UserRound, Settings, Map, Activity, HandCoins, CircleHelp, BrainCircuit, Building2,
} from 'lucide-react';import { cn } from '../lib/utils';

// ── nav data ──────────────────────────────────────────────────────────────────

const adminNav = [
  { label: 'Operations', items: [
    { path: '/dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
    { path: '/farmers',       label: 'Farmers',        icon: Users },
    { path: '/loans',         label: 'Loan Requests',  icon: FileText },
    { path: '/inputs',        label: 'Inventory',      icon: Package },
    { path: '/agents',        label: 'Agents',         icon: UserCheck },
    { path: '/suppliers',     label: 'Suppliers',      icon: Building2 },
    { path: '/repayments',    label: 'Repayments',     icon: CreditCard },
    { path: '/notifications', label: 'Notifications',  icon: Bell },
    { path: '/ussd',          label: 'USSD Simulator', icon: Smartphone },
  ]},
];

const agentNav = [
  { label: 'Field Operations', items: [
    { path: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
    { path: '/farmers',       label: 'Farmers',       icon: Users },
    { path: '/loans',         label: 'Loan Requests', icon: FileText },
    { path: '/inputs',        label: 'Inventory',     icon: Package },
    { path: '/suppliers',     label: 'Suppliers',     icon: Building2 },
    { path: '/repayments',    label: 'Repayments',    icon: CreditCard },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ]},
];

const farmerNav = [
  { label: 'Home',    items: [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'My Farm', items: [
    { path: '/farmer/farms',       label: 'My Farms',       icon: Tractor },
    { path: '/farmer/crops',       label: 'Crops',          icon: Wheat },
    { path: '/farmer/activities',  label: 'Activities',     icon: ClipboardList },
    { path: '/farmer/monitoring',  label: 'Monitoring',     icon: Activity },
  ]},
  { label: 'Marketplace', items: [
    { path: '/farmer/marketplace', label: 'Buy Inputs',    icon: Store },
    { path: '/farmer/orders',      label: 'My Orders',     icon: ShoppingBag },
    { path: '/farmer/produce',     label: 'Sell Produce',  icon: Wheat },
    { path: '/farmer/sales',       label: 'My Sales',      icon: BadgeDollarSign },
  ]},
  { label: 'Finance', items: [
    { path: '/farmer/loans',       label: 'My Loans',        icon: Landmark },
    { path: '/farmer/repayments',  label: 'Repayments',      icon: HandCoins },
    { path: '/farmer/finance',     label: 'Summary',         icon: CreditCard },
  ]},
  { label: 'Support', items: [
    { path: '/farmer/ask-expert',          label: 'Ask Expert',    icon: MessageCircleQuestion },
    { path: '/farmer/advice',              label: 'Advice',        icon: Lightbulb },
    { path: '/farmer/crop-recommendations',label: 'AI Farm Advisor', icon: BrainCircuit },
  ]},
  { label: 'Services', items: [
    { path: '/farmer/notifications', label: 'Notifications', icon: Bell },
    { path: '/farmer/ussd',          label: 'USSD',          icon: Smartphone },
    { path: '/farmer/iot',           label: 'Smart Farm',    icon: Radio },
  ]},
  { label: 'Account', items: [
    { path: '/farmer/profile',   label: 'My Profile', icon: UserRound },
    { path: '/farmer/settings',  label: 'Settings',   icon: Settings },
  ]},
];

// ── NavGroup — collapsible on mobile, always open on desktop ─────────────────

function NavGroup({ label, items, collapsed, onToggle, dark }: {
  label: string; items: typeof adminNav[0]['items'];
  collapsed: boolean; onToggle: () => void; dark: boolean;
}) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors',
          dark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
        )}
      >
        {label}
        <ChevronRight className={cn('h-3 w-3 transition-transform', !collapsed && 'rotate-90')} />
      </button>
      {!collapsed && (
        <div className="mt-0.5 space-y-0.5">
          {items.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'sidebar-link group',
                isActive && 'active',
                dark && !isActive && '!text-slate-400 hover:!bg-slate-800 hover:!text-green-400'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────

export default function Layout() {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark]               = useState(false);
  const [profileOpen, setProfile]     = useState(false);
  const [collapsed, setCollapsed]     = useState<Record<string, boolean>>({});
  const profileRef = useRef<HTMLDivElement>(null);

  const navGroups = user?.role === 'FARMER' ? farmerNav
    : user?.role === 'AGENT' ? agentNav : adminNav;

  useEffect(() => {
    document.body.classList.toggle('dark-mode', dark);
    return () => document.body.classList.remove('dark-mode');
  }, [dark]);

  // close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const toggleGroup = (label: string) =>
    setCollapsed(p => ({ ...p, [label]: !p[label] }));

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  return (
    <div className={cn('flex min-h-screen', dark ? 'bg-slate-950' : 'bg-slate-50')}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        dark ? 'bg-surface-900/95 backdrop-blur-xl border-r border-surface-800' : 'bg-surface-50/90 backdrop-blur-xl border-r border-surface-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)]'
      )}>

        {/* Logo */}
        <div className={cn('flex h-20 shrink-0 items-center gap-4 px-6', dark ? 'border-b border-surface-800' : 'border-b border-surface-200')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl shadow-primary-600/30">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black tracking-tight bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-200">
              AGROBUS
            </p>
            <p className={cn('text-[10px] font-bold uppercase tracking-widest', dark ? 'text-surface-500' : 'text-surface-400')}>
              Agri Credit Platform
            </p>
          </div>
          <button className="ml-auto rounded-lg p-2 lg:hidden hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map(group => (
            <NavGroup
              key={group.label}
              label={group.label}
              items={group.items}
              collapsed={!!collapsed[group.label]}
              onToggle={() => toggleGroup(group.label)}
              dark={dark}
            />
          ))}
        </nav>

        {/* User footer */}
        <div className={cn('shrink-0 border-t p-4', dark ? 'border-surface-800' : 'border-surface-200')}>
          <div className={cn('flex items-center gap-3 rounded-2xl p-3 border transition-colors', dark ? 'bg-surface-800 hover:bg-surface-700 border-surface-700' : 'bg-white hover:bg-surface-50 border-surface-200 shadow-sm')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white shadow-inner">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn('truncate text-sm font-bold', dark ? 'text-white' : 'text-surface-900')}>
                {user?.fullName}
              </p>
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Top bar */}
        <header className={cn(
          'sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b px-6 backdrop-blur-2xl transition-colors',
          dark ? 'border-surface-800 bg-surface-900/70' : 'border-surface-200 bg-white/70 shadow-[0_4px_32px_rgba(0,0,0,0.02)]'
        )}>
          <div className="flex items-center gap-4">
            <button className={cn('rounded-xl p-2.5 transition-colors lg:hidden', dark ? 'hover:bg-surface-800 text-surface-200' : 'hover:bg-surface-100 text-surface-700')} onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className={cn('text-lg font-black tracking-tight', dark ? 'text-white' : 'text-surface-900')}>
                {location.pathname === '/dashboard' ? `Good day, ${user?.fullName?.split(' ')[0]}` : ''}
              </p>
              <p className={cn('text-[11px] font-semibold uppercase tracking-widest', dark ? 'text-surface-500' : 'text-surface-500')}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Dark mode */}
            <button onClick={() => setDark(d => !d)}
              className={cn('rounded-xl p-2.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500', dark ? 'bg-surface-800 text-yellow-400 hover:bg-surface-700 hover:scale-105' : 'bg-surface-100 text-surface-600 hover:bg-surface-200 hover:scale-105')}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate(user?.role === 'FARMER' ? '/farmer/notifications' : '/notifications')}
              className={cn('relative rounded-xl p-2.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500', dark ? 'bg-surface-800 text-surface-300 hover:bg-surface-700 hover:scale-105' : 'bg-surface-100 text-surface-600 hover:bg-surface-200 hover:scale-105')}>
              <Bell className="h-4 w-4" />
              {/* notification dot */}
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-green-500" />
            </button>

            {/* Profile */}
            <div ref={profileRef} className="relative ml-2 border-l border-surface-200 dark:border-surface-800 pl-3">
              <button onClick={() => setProfile(p => !p)}
                className={cn('flex items-center gap-2.5 rounded-2xl px-2.5 py-1.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500 border border-transparent', dark ? 'hover:bg-surface-800 hover:border-surface-700' : 'hover:bg-white hover:border-surface-200 hover:shadow-sm')}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white shadow-inner">
                  {initials}
                </div>
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', profileOpen ? 'rotate-180 text-primary-500' : 'text-surface-400')} />
              </button>

              {profileOpen && (
                <div className={cn(
                  'absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-2 z-50',
                  dark ? 'border-surface-700 bg-surface-800/95 backdrop-blur-xl' : 'border-surface-200 bg-white/95 backdrop-blur-xl'
                )}>
                  {/* Profile info */}
                  <div className={cn('p-5 border-b', dark ? 'border-surface-700/50' : 'border-surface-100')}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-inner">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className={cn('truncate text-sm font-bold', dark ? 'text-white' : 'text-surface-900')}>{user?.fullName}</p>
                        <p className={cn('truncate text-xs mt-0.5', dark ? 'text-surface-400' : 'text-surface-500')}>{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-surface-200 dark:border-surface-700">
                      <span className="inline-flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-700 dark:text-primary-300">
                        {user?.role} Account
                      </span>
                    </div>
                  </div>

                  {user?.role === 'FARMER' && (
                    <Link to="/farmer/profile" onClick={() => setProfile(false)}
                      className={cn('flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors', dark ? 'text-surface-200 hover:bg-surface-700/50 hover:text-white' : 'text-surface-700 hover:bg-surface-50 hover:text-primary-700')}>
                      <UserRound className="h-4 w-4" /> My Profile
                    </Link>
                  )}

                  <button onClick={handleLogout}
                    className={cn('flex w-full items-center gap-3 px-5 py-3 text-sm font-semibold text-red-500 transition-colors', dark ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-red-50')}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
