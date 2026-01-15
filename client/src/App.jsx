import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VendorDashboard from './pages/Vendor/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import Marketplace from './pages/Customer/Marketplace';
import Cart from './pages/Customer/Cart'; // Placeholder
import MyOrders from './pages/Customer/MyOrders'; // Placeholder
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/vendor/dashboard" element={
            <ProtectedRoute role="VENDOR"><VendorDashboard /></ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="/cart" element={
            <ProtectedRoute role="CUSTOMER"><Cart /></ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute role="CUSTOMER"><MyOrders /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  );
}

export default App;
