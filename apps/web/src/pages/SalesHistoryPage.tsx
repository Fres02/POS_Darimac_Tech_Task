import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { fetchSales } from "../lib/sales";
import { formatColomboDateTime, formatLkr } from "../lib/format";

export default function SalesHistoryPage() {
  const { user } = useAuth();
  const { data: sales, isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: fetchSales,
  });

  return (
    <main>
      <p>
        <Link to={user?.role === "admin" ? "/admin" : "/pos"}>&larr; Back</Link>
      </p>
      <h1>Sales History</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : sales && sales.length === 0 ? (
        <p>No sales yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Cashier</th>
              <th>Total</th>
              <th>Payment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sales?.map((sale) => (
              <tr key={sale.id}>
                <td>{formatColomboDateTime(sale.createdAt)}</td>
                <td>{sale.cashierName}</td>
                <td>{formatLkr(sale.total)}</td>
                <td>{sale.paymentMethod}</td>
                <td>
                  <Link to={`/sales/${sale.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
