import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/auth/login';
import AuthCallback from './pages/auth/callback';
import Dashboard from './pages/dashboard/index';
import ProfilePage from './pages/profile/index';
import AdminUsersPage from './pages/admin/users';
import QiHomeDashboard from './pages/qihome/index';
import CasesPage from './pages/cases/index';
import VaultPage from './pages/vault/index';
import KnowledgePage from './pages/knowledge/index';
import TaxPage from './pages/tax/index';
import SettingsPage from './pages/settings/index';
import QiCarePage from './pages/qicare/index';
import ModernLayout from './layouts/ModernLayout';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0c] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600 w-10 h-10" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  
  if (loading) return null;
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected Routes inside Modern Layout */}
            <Route element={
                <AuthGuard>
                  <ModernLayout />
                </AuthGuard>
              }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* QiHome Module */}
              <Route path="/qihome" element={<QiHomeDashboard />} />
              
              {/* Admin Only */}
              <Route path="/admin/users" element={
                <AdminGuard>
                  <AdminUsersPage />
                </AdminGuard>
              } />

              {/* Domain Modules */}
              <Route path="/cases" element={<CasesPage />} />
              <Route path="/vault" element={<VaultPage />} />
              <Route path="/knowledge" element={<KnowledgePage />} />
              <Route path="/tax" element={<TaxPage />} />
              <Route path="/qicare" element={<QiCarePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
