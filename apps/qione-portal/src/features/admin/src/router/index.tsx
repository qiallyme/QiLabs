import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import Dashboard from '../pages/admin/Dashboard';
import { CaseManager } from '../features/cases/CaseManager';
import { TimelineModule } from '../features/timeline/TimelineModule';
import { HouseholdModule } from '../features/household/HouseholdModule';
import TenantManager from '../pages/admin/TenantManager';
import UserManager from '../pages/admin/UserManager';
import TableBrowser from '../pages/admin/TableBrowser';
import Login from '../pages/admin/Login';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={
        <PrivateRoute>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<CaseManager />} />
            <Route path="/timeline" element={<TimelineModule />} />
            <Route path="/household" element={<HouseholdModule />} />
            <Route path="/tenants" element={<TenantManager />} />
            <Route path="/users" element={<UserManager />} />
            <Route path="/data" element={<TableBrowser />} />
            <Route path="*" element={<div style={{padding:'20px'}}>404 Not Found</div>} />
          </Routes>
        </PrivateRoute>
      } />
    </Routes>
  );
}
