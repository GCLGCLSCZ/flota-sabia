
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
  Menu,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState, useRef } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Si es móvil, manejamos de otra forma
  useEffect(() => {
    if (!isMobile) {
      // En escritorio, activamos el comportamiento de hover
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Función para manejar el hover en el área sensible
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsSidebarOpen(true);
  };

  // Función para manejar cuando el mouse sale
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 300);
  };

  // Click fuera para cerrar en móvil
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isSidebarOpen]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
          href: "/drivers",
          title: "Choferes",
          icon: <User className="h-5 w-5" />,
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
      {/* Área sensible al hover para la detección */}
      <div 
        className="fixed top-0 left-0 h-full w-4 z-40 cursor-pointer"
        onMouseEnter={handleMouseEnter}
      >
        {/* Mini indicador de menú */}
        {!isSidebarOpen && !isMobile && (
          <div className="absolute top-16 left-1 bg-white dark:bg-gray-800 p-1 rounded-full shadow-md opacity-30 hover:opacity-100 transition-opacity">
            <Menu className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        )}
      </div>

      {/* Botón para abrir menú en móvil */}
      {isMobile && !isSidebarOpen && (
        <button 
          className="fixed top-16 left-2 z-40 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "h-screen fixed top-0 z-30 pt-16 transition-all bg-white border-r dark:bg-gray-950 custom-scrollbar",
          isSidebarOpen
            ? "w-64 transform-none shadow-lg lg:shadow-none"
            : "w-0 -translate-x-full"
        )}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex h-full flex-col gap-2 p-2">
          <div
            className="flex flex-col gap-1"
          >
            {navigationSections.map((section, idx) => (
              <div key={idx} className="px-2 pt-2">
                <h3 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {section.title}
                </h3>
                {section.links.map((link, linkIdx) => (
                  <NavLink
                    key={linkIdx}
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
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Overlay para móvil */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
