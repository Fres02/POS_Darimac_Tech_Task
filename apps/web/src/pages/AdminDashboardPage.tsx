import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, Receipt, Users, ArrowRight, TrendingUp, Wallet, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchDashboard } from "@/lib/dashboard";
import { resendTodayReport } from "@/lib/reports";
import { formatLkr } from "@/lib/format";
import { SalesTrendChart } from "@/components/charts/SalesTrendChart";
import { TopProductsChart } from "@/components/charts/TopProductsChart";

const STAT_TILES = [
  {
    key: "revenue" as const,
    icon: Wallet,
    label: "Today's revenue",
    format: (revenue: number) => formatLkr(revenue),
  },
  {
    key: "transactionCount" as const,
    icon: Receipt,
    label: "Transactions today",
    format: (count: number) => String(count),
  },
  {
    key: "avgBasket" as const,
    icon: TrendingUp,
    label: "Average basket",
    format: (avg: number) => formatLkr(avg),
  },
];

const TILES = [
  {
    to: "/admin/products",
    icon: Package,
    title: "Products",
    description: "Add, edit, and deactivate items in the catalog.",
  },
  {
    to: "/sales",
    icon: Receipt,
    title: "Sales",
    description: "Browse every sale made across all cashiers.",
  },
  {
    to: "/admin/users",
    icon: Users,
    title: "Users",
    description: "Add cashiers and admins, and review the team.",
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  const resendMutation = useMutation({
    mutationFn: resendTodayReport,
    onSuccess: () => toast.success("Today's sales report was resent to your inbox."),
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.fullName}</h1>
          <p className="text-muted-foreground">Here's what you can manage today.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending}
        >
          <Mail /> {resendMutation.isPending ? "Sending..." : "Resend today's report"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {STAT_TILES.map((tile) => (
          <Card key={tile.key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{tile.label}</CardDescription>
                <tile.icon className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">
                {isLoading || !dashboard ? "—" : tile.format(dashboard.today[tile.key])}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales — last 7 days</CardTitle>
            <CardDescription>Daily revenue trend, Asia/Colombo time.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !dashboard ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <SalesTrendChart data={dashboard.salesOverTime} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top products</CardTitle>
            <CardDescription>By revenue, last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !dashboard ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <TopProductsChart data={dashboard.topProducts} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => (
          <Link key={tile.to} to={tile.to}>
            <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <tile.icon className="size-5" />
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="pt-2">{tile.title}</CardTitle>
                <CardDescription>{tile.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
