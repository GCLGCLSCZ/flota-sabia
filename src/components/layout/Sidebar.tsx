
import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  BarChart,
  Settings,
  Home,
  Car,
  Users,
  PieChart,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

type SidebarSection = {
  title: string;
  links: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
};

export default function Sidebar() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  // Si es móvil, cerramos el sidebar por defecto
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  // Datos de navegación
  const navigationSections: SidebarSection[] = [
    {
      title: "Visión General",
      links: [
        {
          href: "/dashboard",
          title: "Dashboard",
          icon: <Home className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Administración",
      links: [
        {
          href: "/vehicles",
          title: "Vehículos",
          icon: <Car className="h-5 w-5" />,
        },
        {
          href: "/payments",
          title: "Pagos",
          icon: <DollarSign className="h-5 w-5" />,
        },
        {
          href: "/payment-analysis",
          title: "Análisis de Pagos",
          icon: <BarChart className="h-5 w-5" />,
        },
        {
          href: "/calendar",
          title: "Calendario",
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          href: "/investors",
          title: "Inversionistas",
          icon: <Users className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Sistema",
      links: [
        {
          href: "/settings",
          title: "Configuración",
          icon: <Settings className="h-5 w-5" />,
        },
      ],
    },
  ];

  return (
    <>
      <div
        className={cn(
          "h-screen fixed top-0 z-30 pt-16 transition-all bg-white border-r dark:bg-gray-950",
          isSidebarOpen
            ? "w-64 transform-none shadow-lg lg:shadow-none"
            : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col gap-2 p-2">
          <div
            className={cn(
              "flex flex-col gap-1",
              !isSidebarOpen && "lg:items-center lg:gap-1"
            )}
          >
            {navigationSections.map((section, idx) => (
              <div key={idx} className="px-2 pt-2">
                {isSidebarOpen && (
                  <h3 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {section.title}
                  </h3>
                )}
                {section.links.map((link, linkIdx) => (
                  <div key={linkIdx}>
                    {isSidebarOpen ? (
                      <NavLink
                        to={link.href}
                        className={({ isActive }) =>
                          cn(
                            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "transparent"
                          )
                        }
                      >
                        {link.icon}
                        <span className="ml-3">{link.title}</span>
                      </NavLink>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <NavLink
                              to={link.href}
                              className={({ isActive }) =>
                                cn(
                                  "flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground",
                                  isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "transparent"
                                )
                              }
                            >
                              {link.icon}
                            </NavLink>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {link.title}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
