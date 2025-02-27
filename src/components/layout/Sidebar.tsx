
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMobileDetect } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Car,
  Home,
  Menu,
  Wallet,
  CalendarIcon,
  Users,
  Settings,
  BarChart,
  CreditCard
} from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const isMobile = useMobileDetect();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { to: "/", icon: <Home className="h-5 w-5" />, label: "Inicio" },
    { to: "/vehicles", icon: <Car className="h-5 w-5" />, label: "Vehículos" },
    { to: "/payments", icon: <Wallet className="h-5 w-5" />, label: "Pagos" },
    { to: "/caja", icon: <BarChart className="h-5 w-5" />, label: "Caja" },
    { to: "/investor-payments", icon: <CreditCard className="h-5 w-5" />, label: "Pagos a Inversionistas" },
    { to: "/investors", icon: <Users className="h-5 w-5" />, label: "Inversionistas" },
    { to: "/calendar", icon: <CalendarIcon className="h-5 w-5" />, label: "Calendario" },
    { to: "/drivers", icon: <Users className="h-5 w-5" />, label: "Conductores" },
    { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Configuración" },
  ];

  const SidebarContent = () => (
    <div className="h-full py-6 pl-6 pr-3">
      <h2 className="mb-8 text-lg font-semibold tracking-tight">Flota Z</h2>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent" : "transparent"
                )
              }
              onClick={() => setOpen(false)}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="h-screen border-r">
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;
