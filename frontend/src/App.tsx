import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
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
import FarmerAIAdvisorPage from './pages/FarmerAIAdvisorPage';
import FarmerProfilePage from './pages/FarmerProfilePage';
import FarmerFarmsPage from './pages/FarmerFarmsPage';
import FarmerLoansPage from './pages/FarmerLoansPage';
import FarmerRepaymentsPage from './pages/FarmerRepaymentsPage';
import FarmerNotificationsPage from './pages/FarmerNotificationsPage';
import FarmerCropsPage from './pages/FarmerCropsPage';
import FarmerSoilAnalysisPage from './pages/FarmerSoilAnalysisPage';
import FarmerIntelligencePage from './pages/FarmerIntelligencePage';
import FarmerActivitiesPage from './pages/FarmerActivitiesPage';
import FarmerFinancePage from './pages/FarmerFinancePage';
import FarmerHarvestsPage from './pages/FarmerHarvestsPage';
import FarmerOrderTrackingPage from './pages/FarmerOrderTrackingPage';
import FarmerPerformancePage from './pages/FarmerPerformancePage';
import SuppliersPage from './pages/SuppliersPage';
import AdminAIIntelligencePage from './pages/AdminAIIntelligencePage';
import {
  Activity, BadgeDollarSign, Lightbulb, MessageCircleQuestion, Radio, Store, Tractor, Wheat
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

function FarmerFeature({ title, section, description, icon: Icon, nextPath, nextLabel }: {
  title: string;
  section: string;
  description: string;
  icon: typeof Tractor;
  nextPath?: string;
  nextLabel?: string;
  nextState?: Record<string, unknown>;
}) {
  return <RoleRoute roles={['FARMER']}><FarmerFeaturePage title={title} section={section} description={description} icon={Icon} nextPath={nextPath} nextLabel={nextLabel} nextState={nextState} /></RoleRoute>;
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<RoleAwareDashboard />} />
            <Route path="farmers" element={<RoleRoute roles={['ADMIN', 'AGENT']}><FarmersPage /></RoleRoute>} />
            <Route path="loans" element={<RoleRoute roles={['ADMIN', 'AGENT']}><LoansPage /></RoleRoute>} />
            <Route path="inputs" element={<RoleRoute roles={['ADMIN', 'AGENT']}><InputsPage /></RoleRoute>} />
            <Route path="agents" element={<RoleRoute roles={['ADMIN', 'AGENT']}><AgentsPage /></RoleRoute>} />
            <Route path="repayments" element={<RoleRoute roles={['ADMIN', 'AGENT']}><RepaymentsPage /></RoleRoute>} />
            <Route path="notifications" element={<RoleRoute roles={['ADMIN', 'AGENT']}><NotificationsPage /></RoleRoute>} />
            <Route path="suppliers"     element={<RoleRoute roles={['ADMIN', 'AGENT']}><SuppliersPage /></RoleRoute>} />
            <Route path="ussd"          element={<RoleRoute roles={['ADMIN', 'AGENT']}><USSDPage /></RoleRoute>} />
            <Route path="ai-intelligence" element={<RoleRoute roles={['ADMIN', 'AGENT']}><AdminAIIntelligencePage /></RoleRoute>} />

            <Route path="farmer/farms" element={<RoleRoute roles={['FARMER']}><FarmerFarmsPage /></RoleRoute>} />
            <Route path="farmer/loans" element={<RoleRoute roles={['FARMER']}><FarmerLoansPage /></RoleRoute>} />
            <Route path="farmer/repayments" element={<RoleRoute roles={['FARMER']}><FarmerRepaymentsPage /></RoleRoute>} />
            <Route path="farmer/notifications" element={<RoleRoute roles={['FARMER']}><FarmerNotificationsPage /></RoleRoute>} />
            <Route path="farmer/crops" element={<RoleRoute roles={['FARMER']}><FarmerCropsPage /></RoleRoute>} />
            <Route path="farmer/crop-planning" element={<RoleRoute roles={['FARMER']}><FarmerCropsPage initialStatus="PLANNED" /></RoleRoute>} />
            <Route path="farmer/harvests" element={<RoleRoute roles={['FARMER']}><FarmerHarvestsPage /></RoleRoute>} />
            <Route path="farmer/activities" element={<RoleRoute roles={['FARMER']}><FarmerActivitiesPage /></RoleRoute>} />
            <Route path="farmer/monitoring" element={<FarmerFeature title="Farm Monitoring" section="My Farm" description="Review connected farm monitoring data when devices and services are available." icon={Activity} />} />
            <Route path="farmer/marketplace" element={<FarmerFeature title="Input Marketplace" section="Input procurement" description="A supplier catalogue and checkout service is not connected. Farmers can still request input credit and follow the review process." icon={Store} nextPath="/farmer/loans" nextLabel="Request input credit" nextState={{ openForm: true }} />} />
            <Route path="farmer/orders" element={<RoleRoute roles={['FARMER']}><FarmerOrderTrackingPage /></RoleRoute>} />
            <Route path="farmer/produce" element={<FarmerFeature title="Sell Produce" section="Marketplace" description="Register and publish your harvested produce when the produce service is connected." icon={Wheat} />} />
            <Route path="farmer/sales" element={<FarmerFeature title="My Sales" section="Marketplace" description="Review your completed produce sales from real marketplace records." icon={BadgeDollarSign} />} />
            <Route path="farmer/performance" element={<RoleRoute roles={['FARMER']}><FarmerPerformancePage /></RoleRoute>} />
            <Route path="farmer/ask-expert" element={<FarmerFeature title="Ask an Expert" section="Agricultural Support" description="Submit crop and farming questions when the advisory service is connected." icon={MessageCircleQuestion} />} />
            <Route path="farmer/advice" element={<FarmerFeature title="Agricultural Advice" section="Agricultural Support" description="Read responses and advice addressed to your authenticated farmer account." icon={Lightbulb} />} />
            <Route path="farmer/soil-analysis" element={<RoleRoute roles={['FARMER']}><FarmerSoilAnalysisPage /></RoleRoute>} />
            <Route path="farmer/intelligence" element={<RoleRoute roles={['FARMER']}><FarmerIntelligencePage /></RoleRoute>} />
            <Route path="farmer/crop-recommendations" element={<RoleRoute roles={['FARMER']}><FarmerAIAdvisorPage /></RoleRoute>} />
            <Route path="farmer/finance" element={<RoleRoute roles={['FARMER']}><FarmerFinancePage /></RoleRoute>} />
            <Route path="farmer/ussd" element={<FarmerFeature title="USSD Services" section="Services" description="USSD access is planned around *810#. This page does not simulate a real transaction." icon={Radio} />} />
            <Route path="farmer/iot" element={<FarmerFeature title="Smart Farm / IoT" section="Services" description="Connect farm devices here when the Smart Farm monitoring service becomes available." icon={Radio} />} />
            <Route path="farmer/profile" element={<RoleRoute roles={['FARMER']}><FarmerProfilePage /></RoleRoute>} />
            <Route path="farmer/settings" element={<RoleRoute roles={['FARMER']}><Navigate to="/farmer/profile" replace /></RoleRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


function RoleAwareDashboard() {
  const { user } = useAuth();
  return user?.role === 'FARMER' ? <FarmerHomePage /> : <DashboardPage />;
}
