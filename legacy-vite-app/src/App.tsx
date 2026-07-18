import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppLayout from './components/AppLayout';
import { RequireAuth, RequireLibrarian } from './components/RouteGuards';
import AuthPage from './pages/AuthPage';
import MarketplacePage from './marketplace/MarketplacePage';
import CartPage from './marketplace/CartPage';
import OrdersPage from './marketplace/OrdersPage';
import LibrarianDashboard from './librarian/LibrarianDashboard';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<RequireAuth><AppLayout><Outlet /></AppLayout></RequireAuth>}>
              <Route path="/" element={<MarketplacePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/librarian" element={<RequireLibrarian><LibrarianDashboard /></RequireLibrarian>} />
              <Route path="/admin" element={<RequireLibrarian><AdminPage /></RequireLibrarian>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
