import { useAuth } from "../context/AuthContext";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.fullName}.</p>
      <button onClick={logout}>Log out</button>
    </main>
  );
}
