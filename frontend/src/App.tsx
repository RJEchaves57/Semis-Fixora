import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequestsProvider } from './context/RequestsContext';
import ProtectedRoute from './components/ProtectedRoute';
import { roleHome } from './data/constants';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import Sections from './pages/admin/Sections';
import UserLayout from './pages/user/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import MyRequests from './pages/user/MyRequests';
import NewRequest from './pages/user/NewRequest';
import MaintenanceLayout from './pages/maintenance/MaintenanceLayout';
import MaintenanceDashboard from './pages/maintenance/MaintenanceDashboard';
import MyTasks from './pages/maintenance/MyTasks';
import './styles/admin.css';
import './styles/admin-extra.css';
import './styles/shared.css';
import './styles/auth.css';
import './styles/user.css';
import './styles/maintenance.css';

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? roleHome[user.role] : '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RequestsProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Admin: approve / decline / assign — no "new request" here */}
            <Route path="/admin" element={<ProtectedRoute role="admin" />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="facilities" element={<Sections />} />
                <Route path="staff" element={<Sections />} />
                <Route path="schedule" element={<Sections />} />
                <Route path="settings" element={<Sections />} />
              </Route>
            </Route>

            {/* User: the only role that can create requests */}
            <Route path="/user" element={<ProtectedRoute role="user" />}>
              <Route element={<UserLayout />}>
                <Route index element={<UserDashboard />} />
                <Route path="requests" element={<MyRequests />} />
                <Route path="new" element={<NewRequest />} />
              </Route>
            </Route>

            {/* Maintenance team: work on assigned tasks */}
            <Route path="/maintenance" element={<ProtectedRoute role="maintenance" />}>
              <Route element={<MaintenanceLayout />}>
                <Route index element={<MaintenanceDashboard />} />
                <Route path="tasks" element={<MyTasks />} />
              </Route>
            </Route>

            <Route path="*" element={<Home />} />
          </Routes>
        </RequestsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
