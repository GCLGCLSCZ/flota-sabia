
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Car,
  Users,
  User2,
  DollarSign,
  Settings,
  Menu,
  XIcon,
  LayoutDashboard,
  BellRing,
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

type SidebarProps = {
  collapsed?: boolean;
  className?: string;
};

export default function Sidebar({ collapsed, className }: SidebarProps) {
  const location = useLocation();
  const { isMobile } = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40">
            <div className="fixed inset-y-0 left-0 w-64 bg-background border-r p-4 shadow-lg z-50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center py-3 px-3 rounded-md hover:bg-muted transition-colors",
                      location.pathname === item.path &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className={cn(
        "pb-12 border-r",
        collapsed ? "w-14" : "w-64",
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className={cn("text-lg font-semibold", collapsed && "hidden")}>
            Dashboard
          </h2>
        </div>
        <div className="px-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center py-2 px-2 rounded-md hover:bg-muted transition-colors",
                  location.pathname.startsWith(item.pathPrefix || item.path) &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                  collapsed ? "justify-center" : ""
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", !collapsed && "mr-2")}
                />
                <span className={cn(collapsed && "hidden")}>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const menuItems = [
  {
    name: "Inicio",
    path: "/",
    icon: Home,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Vehículos",
    path: "/vehicles",
    pathPrefix: "/vehicles",
    icon: Car,
  },
  {
    name: "Conductores",
    path: "/drivers",
    pathPrefix: "/drivers",
    icon: User2,
  },
  {
    name: "Inversionistas",
    path: "/investors",
    pathPrefix: "/investors",
    icon: Users,
  },
  {
    name: "Pagos",
    path: "/payments",
    pathPrefix: "/payments",
    icon: DollarSign,
  },
  {
    name: "Configuración",
    path: "/settings",
    pathPrefix: "/settings",
    icon: Settings,
  },
];
