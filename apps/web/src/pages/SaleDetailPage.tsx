import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { fetchSaleDetail } from "../lib/sales";
import { Receipt } from "../components/Receipt";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link to="/sales">
          <ArrowLeft /> Back to sales history
        </Link>
      </Button>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{(error as Error).message}</AlertTitle>
        </Alert>
      )}

      {sale && (
        <Card>
          <CardContent className="pt-6">
            <Receipt sale={sale} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
