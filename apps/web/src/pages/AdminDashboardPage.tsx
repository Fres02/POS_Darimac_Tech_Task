import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.fullName}.</p>
      <p>
        <Link to="/admin/products">Manage products</Link>
      </p>
      <p>
        <Link to="/sales">View all sales</Link>
      </p>
      <button onClick={logout}>Log out</button>
    </main>
  );
}
