import { useEffect, useState } from 'react';
import { Link, Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, Package, UserCheck, CreditCard,
  Bell, Smartphone, LogOut, Menu, X, ChevronDown, Sprout, Sun, Moon,
  Tractor, Wheat, ClipboardList, Radio, ShoppingBag, Store, BadgeDollarSign,
  MessageCircleQuestion, Lightbulb, Landmark, BarChart3, UserRound, Settings,
  Map, Activity, HandCoins, CircleHelp
} from 'lucide-react';

const adminNavGroups = [{ label: 'Operations', items: [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/farmers', label: 'Farmers', icon: Users },
  { path: '/loans', label: 'Loan Requests', icon: FileText },
  { path: '/inputs', label: 'Inventory', icon: Package },
  { path: '/agents', label: 'Agents', icon: UserCheck },
  { path: '/repayments', label: 'Repayments', icon: CreditCard },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/ussd', label: 'USSD Simulator', icon: Smartphone },
]}];

const agentNavGroups = [{ label: 'Field Operations', items: [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/farmers', label: 'Farmers', icon: Users },
  { path: '/loans', label: 'Loan Requests', icon: FileText },
  { path: '/inputs', label: 'Inventory', icon: Package },
  { path: '/repayments', label: 'Repayments', icon: CreditCard },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/ussd', label: 'USSD Simulator', icon: Smartphone },
]}];

const farmerNavGroups = [
  { label: 'Dashboard', items: [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'My Farm', items: [
    { path: '/farmer/farms', label: 'My Farms', icon: Tractor },
    { path: '/farmer/crops', label: 'Crops', icon: Wheat },
    { path: '/farmer/activities', label: 'Farm Activities', icon: ClipboardList },
    { path: '/farmer/monitoring', label: 'Farm Monitoring', icon: Activity },
  ] },
  { label: 'Marketplace', items: [
    { path: '/farmer/marketplace', label: 'Buy Agricultural Inputs', icon: Store },
    { path: '/farmer/orders', label: 'My Orders', icon: ShoppingBag },
    { path: '/farmer/produce', label: 'Sell Produce', icon: Wheat },
    { path: '/farmer/sales', label: 'My Sales', icon: BadgeDollarSign },
  ] },
  { label: 'Farm Management', items: [
    { path: '/farmer/crop-planning', label: 'Crop Planning', icon: Map },
    { path: '/farmer/harvests', label: 'Harvests', icon: Wheat },
    { path: '/farmer/performance', label: 'Farm Performance', icon: BarChart3 },
  ] },
  { label: 'Agricultural Support', items: [
    { path: '/farmer/ask-expert', label: 'Ask an Expert', icon: MessageCircleQuestion },
    { path: '/farmer/advice', label: 'Agricultural Advice', icon: Lightbulb },
    { path: '/farmer/crop-recommendations', label: 'Crop Recommendations', icon: CircleHelp },
  ] },
  { label: 'Finance', items: [
    { path: '/farmer/loans', label: 'My Loans', icon: Landmark },
    { path: '/farmer/repayments', label: 'Repayments', icon: HandCoins },
    { path: '/farmer/finance', label: 'Financial Summary', icon: CreditCard },
  ] },
  { label: 'Services', items: [
    { path: '/farmer/notifications', label: 'Notifications', icon: Bell },
    { path: '/farmer/ussd', label: 'USSD Services', icon: Smartphone },
    { path: '/farmer/iot', label: 'Smart Farm / IoT', icon: Radio },
  ] },
  { label: 'Account', items: [
    { path: '/farmer/profile', label: 'My Profile', icon: UserRound },
    { path: '/farmer/settings', label: 'Settings', icon: Settings },
  ] },
];

const pageContext: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Your agricultural workspace at a glance' },
  '/farmer/farms': { title: 'My Farms', description: 'Manage your farms and fields' },
  '/farmer/crops': { title: 'Crops', description: 'Track your crop lifecycle' },
  '/farmer/activities': { title: 'Farm Activities', description: 'Keep your farm work organized' },
  '/farmer/monitoring': { title: 'Farm Monitoring', description: 'Stay close to your farm conditions' },
  '/farmer/marketplace': { title: 'Input Marketplace', description: 'Find supplies for your farm' },
  '/farmer/orders': { title: 'My Orders', description: 'Follow your marketplace orders' },
  '/farmer/produce': { title: 'Sell Produce', description: 'Connect your harvest with buyers' },
  '/farmer/sales': { title: 'My Sales', description: 'Review your produce sales' },
  '/farmer/crop-planning': { title: 'Crop Planning', description: 'Prepare your next growing season' },
  '/farmer/harvests': { title: 'Harvests', description: 'Review your harvest records' },
  '/farmer/performance': { title: 'Farm Performance', description: 'Understand your farm results' },
  '/farmer/ask-expert': { title: 'Ask an Expert', description: 'Get practical agricultural guidance' },
  '/farmer/advice': { title: 'Agricultural Advice', description: 'Your questions and expert guidance' },
  '/farmer/crop-recommendations': { title: 'Crop Recommendations', description: 'Explore recommendations for your farm' },
  '/farmer/loans': { title: 'My Loans', description: 'Review finance linked to your account' },
  '/farmer/repayments': { title: 'Repayments', description: 'Keep track of your repayment history' },
  '/farmer/finance': { title: 'Financial Summary', description: 'Your farm finances in one place' },
  '/farmer/notifications': { title: 'Notifications', description: 'Important updates for your farm' },
  '/farmer/ussd': { title: 'USSD Services', description: 'Access planned farmer services by phone' },
  '/farmer/iot': { title: 'Smart Farm', description: 'Connected monitoring for your farm' },
  '/farmer/profile': { title: 'My Profile', description: 'Manage your account information' },
  '/farmer/settings': { title: 'Settings', description: 'Configure your farmer workspace' },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navGroups = user?.role === 'FARMER' ? farmerNavGroups : user?.role === 'AGENT' ? agentNavGroups : adminNavGroups;
  const currentPage = pageContext[location.pathname] || { title: 'AGROBUS', description: 'Agricultural operations workspace' };

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    return () => document.body.classList.remove('dark-mode');
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-inherit">
          <div className="w-10 h-10 gradient-green rounded-xl flex items-center justify-center shadow-lg">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              AGROBUS
            </h1>
            <p className={`text-[10px] font-medium tracking-wider uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Agri Credit Platform
            </p>
          </div>
          <button className="lg:hidden ml-auto p-1" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label} className="mb-5">
              <p className={`text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{group.label}</p>
              {group.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''} ${darkMode && !isActive ? '!text-gray-400 hover:!bg-gray-800 hover:!text-green-400' : ''}`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-green-600 font-medium">{user?.role || 'Admin'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className={`h-14 flex items-center justify-between px-4 lg:px-6 border-b sticky top-0 z-30
          ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur-xl`}>
          
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentPage.title}
              </h2>
              <p className={`text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {user?.role === 'FARMER' ? currentPage.description : new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate(user?.role === 'FARMER' ? '/farmer/notifications' : '/notifications')}
              className={`p-2.5 rounded-xl relative transition-all ${darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <div className="w-8 h-8 gradient-green rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {profileOpen && (
                <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl border z-50 animate-fade-in overflow-hidden
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.fullName}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  {user?.role === 'FARMER' && (
                    <Link
                      to="/farmer/profile"
                      onClick={() => setProfileOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium text-green-700 transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-green-50'}`}
                    >
                      View my profile
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 transition-all
                      ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'}`}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
