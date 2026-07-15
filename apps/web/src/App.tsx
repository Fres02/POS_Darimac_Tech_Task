import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import CashierPosPage from "./pages/CashierPosPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import SaleDetailPage from "./pages/SaleDetailPage";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/pos"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["cashier"]} />}>
        <Route path="/pos" element={<CashierPosPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin", "cashier"]} />}>
        <Route path="/sales" element={<SalesHistoryPage />} />
        <Route path="/sales/:id" element={<SaleDetailPage />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
    </Routes>
  );
}
