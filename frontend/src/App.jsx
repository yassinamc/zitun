import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import CustomerCreate from './pages/CustomerCreate';
import ReceptionCreate from './pages/ReceptionCreate';
import { useAuth } from './context/AuthContext';

function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/new" element={<CustomerCreate />} />
          <Route path="receptions/new" element={<ReceptionCreate />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
