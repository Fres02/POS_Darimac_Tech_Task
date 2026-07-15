import { Link } from "react-router-dom";
import { Package, Receipt, Users, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.fullName}</h1>
        <p className="text-muted-foreground">Here's what you can manage today.</p>
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
