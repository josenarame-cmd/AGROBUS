import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, Package, UserCheck, CreditCard,
  Bell, Smartphone, LogOut, Menu, X, ChevronDown, ChevronRight, Sprout,
  Sun, Moon, Tractor, Wheat, ClipboardList, Radio, ShoppingBag, Store,
  BadgeDollarSign, MessageCircleQuestion, Lightbulb, Landmark, BarChart3,
  UserRound, Settings, Map, Activity, HandCoins, CircleHelp, Building2,
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
    { path: '/farmer/crop-recommendations',label: 'Crop Tips',     icon: CircleHelp },
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
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
      )}>

        {/* Logo */}
        <div className={cn('flex h-14 shrink-0 items-center gap-3 border-b px-5', dark ? 'border-slate-800' : 'border-slate-100')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-black tracking-tight bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              AGROBUS
            </p>
            <p className={cn('text-[9px] font-semibold uppercase tracking-widest', dark ? 'text-slate-500' : 'text-slate-400')}>
              Agri Credit Platform
            </p>
          </div>
          <button className="ml-auto rounded-lg p-1.5 lg:hidden hover:bg-slate-100" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
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
        <div className={cn('shrink-0 border-t p-3', dark ? 'border-slate-800' : 'border-slate-100')}>
          <div className={cn('flex items-center gap-3 rounded-xl p-2.5', dark ? 'bg-slate-800' : 'bg-slate-50')}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn('truncate text-sm font-semibold', dark ? 'text-white' : 'text-slate-900')}>
                {user?.fullName}
              </p>
              <p className="text-xs font-medium text-green-600">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Top bar */}
        <header className={cn(
          'sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-4 backdrop-blur-xl lg:px-6',
          dark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-white/90'
        )}>
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className={cn('text-sm font-bold', dark ? 'text-white' : 'text-slate-900')}>
                {location.pathname === '/dashboard' ? `Good day, ${user?.fullName?.split(' ')[0]}` : ''}
              </p>
              <p className={cn('text-[11px]', dark ? 'text-slate-500' : 'text-slate-400')}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Dark mode */}
            <button onClick={() => setDark(d => !d)}
              className={cn('rounded-xl p-2.5 transition-colors', dark ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate(user?.role === 'FARMER' ? '/farmer/notifications' : '/notifications')}
              className={cn('relative rounded-xl p-2.5 transition-colors', dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
              <Bell className="h-4 w-4" />
              {/* notification dot */}
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-green-500" />
            </button>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button onClick={() => setProfile(p => !p)}
                className={cn('flex items-center gap-2 rounded-xl px-2.5 py-2 transition-colors', dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100')}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-xs font-bold text-white">
                  {initials}
                </div>
                <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', profileOpen && 'rotate-180')} />
              </button>

              {profileOpen && (
                <div className={cn(
                  'absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border shadow-xl animate-fade-in z-50',
                  dark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'
                )}>
                  {/* Profile info */}
                  <div className={cn('p-4 border-b', dark ? 'border-slate-700' : 'border-slate-100')}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-sm font-bold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className={cn('truncate text-sm font-semibold', dark ? 'text-white' : 'text-slate-900')}>{user?.fullName}</p>
                        <p className={cn('truncate text-xs', dark ? 'text-slate-400' : 'text-slate-500')}>{user?.email}</p>
                      </div>
                    </div>
                    <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      {user?.role}
                    </span>
                  </div>

                  {user?.role === 'FARMER' && (
                    <Link to="/farmer/profile" onClick={() => setProfile(false)}
                      className={cn('flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors', dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50')}>
                      <UserRound className="h-4 w-4" /> My Profile
                    </Link>
                  )}

                  <button onClick={handleLogout}
                    className={cn('flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 transition-colors', dark ? 'hover:bg-slate-700' : 'hover:bg-red-50')}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
