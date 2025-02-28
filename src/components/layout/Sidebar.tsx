
import { LucideIcon, Home, Car, CreditCard, Users, Clipboard, Calendar, Settings, ReceiptText, CalendarOff } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, href, active, onClick }: SidebarItemProps) => {
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-x-2 text-slate-500 font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
          (isActive || active) && "text-slate-700 bg-slate-200/50 hover:bg-slate-200/50 hover:text-slate-700",
        )
      }
      onClick={onClick}
    >
      <div className="flex items-center gap-x-2 py-4">
        <Icon
          size={22}
          className={cn(
            "text-slate-500",
            (active) && "text-slate-700"
          )}
        />
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-sky-500 h-full transition-all",
          (active) && "opacity-100"
        )}
      />
    </NavLink>
  );
};

export const Sidebar = () => {
  const { isMobile, setMobileOpen } = useMobile();
  const pathname = useLocation().pathname;

  const handleClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const routes = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: Car,
      label: "Vehículos",
      href: "/vehicles",
      active: pathname === "/vehicles",
    },
    {
      icon: CalendarOff,
      label: "Días no Trabajados",
      href: "/nonworkdays",
      active: pathname === "/nonworkdays",
    },
    {
      icon: CreditCard,
      label: "Pagos",
      href: "/payments",
      active: pathname === "/payments",
    },
    {
      icon: Users,
      label: "Inversores",
      href: "/investors",
      active: pathname === "/investors",
    },
    {
      icon: Clipboard,
      label: "Conductores",
      href: "/drivers",
      active: pathname === "/drivers",
    },
    {
      icon: Settings,
      label: "Configuración",
      href: "/settings",
      active: pathname === "/settings",
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-white shadow-sm border-r">
      <div className="p-6 flex items-center justify-center border-b">
        <ReceiptText className="text-sky-500 h-10 w-10" />
        <h1 className="text-2xl font-bold ml-2">AutoFin</h1>
      </div>
      <div className="flex flex-col w-full mt-4">
        {routes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
            active={route.active}
            onClick={handleClick}
          />
        ))}
      </div>
    </div>
  );
};
