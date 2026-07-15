import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export function NavTabs({ items }: { items: { to: string; label: string }[] }) {
  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/admin" || item.to === "/pos"}
          className={({ isActive }) =>
            cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
