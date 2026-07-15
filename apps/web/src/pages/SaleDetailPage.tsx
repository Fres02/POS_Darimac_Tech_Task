import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSaleDetail } from "../lib/sales";
import { Receipt } from "../components/Receipt";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: sale,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sale", id],
    queryFn: () => fetchSaleDetail(id!),
    enabled: !!id,
  });

  return (
    <main>
      <p>
        <Link to="/sales">&larr; Back to sales history</Link>
      </p>
      {isLoading && <p>Loading...</p>}
      {error && <p role="alert">{(error as Error).message}</p>}
      {sale && <Receipt sale={sale} />}
    </main>
  );
}
