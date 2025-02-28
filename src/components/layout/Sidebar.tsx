
import { useState, useEffect, useCallback, memo } from "react";
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
  BarChart
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";

type SidebarProps = {
  collapsed?: boolean;
  className?: string;
};

// Definimos los elementos del menú fuera del componente para evitar recrearlos en cada renderizado
const menuItems = [
  {
    name: "Inicio",
    path: "/",
    icon: Home,
    exact: true
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
    name: "Análisis de Pagos",
    path: "/payment-analysis",
    pathPrefix: "/payment-analysis",
    icon: BarChart,
  },
  {
    name: "Configuración",
    path: "/settings",
    pathPrefix: "/settings",
    icon: Settings,
  },
];

// Componente para elementos del menú
const MenuItem = memo(({ 
  item, 
  location, 
  collapsed, 
  onClick 
}: { 
  item: typeof menuItems[0], 
  location: ReturnType<typeof useLocation>, 
  collapsed?: boolean,
  onClick?: () => void
}) => {
  const isActive = item.exact 
    ? location.pathname === item.path 
    : location.pathname.startsWith(item.pathPrefix || item.path);

  return (
    <Link
      to={item.path}
      className={cn(
        "flex items-center py-2 px-2 rounded-md hover:bg-muted transition-colors",
        isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
        collapsed ? "justify-center" : ""
      )}
      onClick={onClick}
    >
      <item.icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
      <span className={cn(collapsed && "hidden")}>{item.name}</span>
    </Link>
  );
});

MenuItem.displayName = "MenuItem";

// Mobile Sidebar
const MobileSidebar = ({ onClose }: { onClose: () => void }) => {
  const location = useLocation();
  
  // Cerrar el sidebar al cambiar de ruta
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40">
      <div className="fixed inset-y-0 left-0 w-64 bg-background border-r p-4 shadow-lg z-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <MenuItem 
              key={item.path} 
              item={item} 
              location={location}
              onClick={onClose}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente principal del Sidebar
function Sidebar({ collapsed = false, className }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Para dispositivos móviles
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {sidebarOpen && <MobileSidebar onClose={closeSidebar} />}
      </>
    );
  }

  // Para escritorio
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
              <MenuItem 
                key={item.path} 
                item={item} 
                location={location}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Sidebar);
