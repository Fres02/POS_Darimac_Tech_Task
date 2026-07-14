import { useAuth } from "../context/AuthContext";

export default function CashierPosPage() {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>POS</h1>
      <p>Welcome, {user?.fullName}.</p>
      <button onClick={logout}>Log out</button>
    </main>
  );
}
