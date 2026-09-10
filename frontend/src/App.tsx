import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import FarmersPage from './pages/FarmersPage';
import LoansPage from './pages/LoansPage';
import InputsPage from './pages/InputsPage';
import AgentsPage from './pages/AgentsPage';
import RepaymentsPage from './pages/RepaymentsPage';
import NotificationsPage from './pages/NotificationsPage';
import USSDPage from './pages/USSDPage';
import FarmerHomePage from './pages/FarmerHomePage';
import FarmerFeaturePage from './pages/FarmerFeaturePage';
import FarmerProfilePage from './pages/FarmerProfilePage';
import FarmerFarmsPage from './pages/FarmerFarmsPage';
import FarmerLoansPage from './pages/FarmerLoansPage';
import FarmerRepaymentsPage from './pages/FarmerRepaymentsPage';
import FarmerNotificationsPage from './pages/FarmerNotificationsPage';
import {
  Activity, BarChart3, BadgeDollarSign, Bell, CircleHelp, ClipboardList, CreditCard,
  HandCoins, Landmark, Lightbulb, Map, MessageCircleQuestion, Radio, Settings,
  ShoppingBag, Store, Tractor, Wheat
} from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 font-semibold text-lg">Loading AGROBUS...</p>
        </div>
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function RoleRoute({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user } = useAuth();
  return user && roles.includes(user.role) ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function FarmerFeature({ title, section, description, icon: Icon }: { title: string; section: string; description: string; icon: typeof Tractor }) {
  return <RoleRoute roles={['FARMER']}><FarmerFeaturePage title={title} section={section} description={description} icon={Icon} /></RoleRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1e293b', color: '#f1f5f9', borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<RoleAwareDashboard />} />
            <Route path="farmers" element={<RoleRoute roles={['ADMIN', 'AGENT']}><FarmersPage /></RoleRoute>} />
            <Route path="loans" element={<RoleRoute roles={['ADMIN', 'AGENT']}><LoansPage /></RoleRoute>} />
            <Route path="inputs" element={<RoleRoute roles={['ADMIN', 'AGENT']}><InputsPage /></RoleRoute>} />
            <Route path="agents" element={<RoleRoute roles={['ADMIN', 'AGENT']}><AgentsPage /></RoleRoute>} />
            <Route path="repayments" element={<RoleRoute roles={['ADMIN', 'AGENT']}><RepaymentsPage /></RoleRoute>} />
            <Route path="notifications" element={<RoleRoute roles={['ADMIN', 'AGENT']}><NotificationsPage /></RoleRoute>} />
            <Route path="ussd" element={<RoleRoute roles={['ADMIN', 'AGENT']}><USSDPage /></RoleRoute>} />

            <Route path="farmer/farms" element={<RoleRoute roles={['FARMER']}><FarmerFarmsPage /></RoleRoute>} />
            <Route path="farmer/loans" element={<RoleRoute roles={['FARMER']}><FarmerLoansPage /></RoleRoute>} />
            <Route path="farmer/repayments" element={<RoleRoute roles={['FARMER']}><FarmerRepaymentsPage /></RoleRoute>} />
            <Route path="farmer/notifications" element={<RoleRoute roles={['FARMER']}><FarmerNotificationsPage /></RoleRoute>} />
            <Route path="farmer/crops" element={<FarmerFeature title="Crops" section="My Farm" description="Track crop records and their lifecycle across your farms." icon={Wheat} />} />
            <Route path="farmer/activities" element={<FarmerFeature title="Farm Activities" section="My Farm" description="Keep a record of work completed on your farms." icon={ClipboardList} />} />
            <Route path="farmer/monitoring" element={<FarmerFeature title="Farm Monitoring" section="My Farm" description="Review connected farm monitoring data when devices and services are available." icon={Activity} />} />
            <Route path="farmer/marketplace" element={<FarmerFeature title="Buy Agricultural Inputs" section="Marketplace" description="Browse agricultural inputs from connected suppliers and place orders when the marketplace service is available." icon={Store} />} />
            <Route path="farmer/orders" element={<FarmerFeature title="My Orders" section="Marketplace" description="Track input orders belonging to your authenticated farmer account." icon={ShoppingBag} />} />
            <Route path="farmer/produce" element={<FarmerFeature title="Sell Produce" section="Marketplace" description="Register and publish your harvested produce when the produce service is connected." icon={Wheat} />} />
            <Route path="farmer/sales" element={<FarmerFeature title="My Sales" section="Marketplace" description="Review your completed produce sales from real marketplace records." icon={BadgeDollarSign} />} />
            <Route path="farmer/crop-planning" element={<FarmerFeature title="Crop Planning" section="Farm Management" description="Plan your next crop cycle using records linked to your farms." icon={Map} />} />
            <Route path="farmer/harvests" element={<FarmerFeature title="Harvests" section="Farm Management" description="Record and review harvests connected to your crop records." icon={Wheat} />} />
            <Route path="farmer/performance" element={<FarmerFeature title="Farm Performance" section="Farm Management" description="View production, expense, and revenue measures calculated from your real farm records." icon={BarChart3} />} />
            <Route path="farmer/ask-expert" element={<FarmerFeature title="Ask an Expert" section="Agricultural Support" description="Submit crop and farming questions when the advisory service is connected." icon={MessageCircleQuestion} />} />
            <Route path="farmer/advice" element={<FarmerFeature title="Agricultural Advice" section="Agricultural Support" description="Read responses and advice addressed to your authenticated farmer account." icon={Lightbulb} />} />
            <Route path="farmer/crop-recommendations" element={<FarmerFeature title="Crop Recommendations" section="Agricultural Support" description="Get recommendations based on your real farm and crop information when available." icon={CircleHelp} />} />
            <Route path="farmer/finance" element={<FarmerFeature title="Financial Summary" section="Finance" description="See a summary calculated from your own loans, repayments, and sales." icon={CreditCard} />} />
            <Route path="farmer/ussd" element={<FarmerFeature title="USSD Services" section="Services" description="USSD access is planned around *810#. This page does not simulate a real transaction." icon={Radio} />} />
            <Route path="farmer/iot" element={<FarmerFeature title="Smart Farm / IoT" section="Services" description="Connect farm devices here when the Smart Farm monitoring service becomes available." icon={Radio} />} />
            <Route path="farmer/profile" element={<RoleRoute roles={['FARMER']}><FarmerProfilePage /></RoleRoute>} />
            <Route path="farmer/settings" element={<FarmerFeature title="Settings" section="Account" description="Account settings will become available as profile-management APIs are introduced." icon={Settings} />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


function RoleAwareDashboard() {
  const { user } = useAuth();
  return user?.role === 'FARMER' ? <FarmerHomePage /> : <DashboardPage />;
}
