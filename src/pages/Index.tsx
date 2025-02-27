
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, DollarSign, Calendar, BarChart, Users, ArrowRight, Sun, Moon, User } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { vehicles, payments } = useApp();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Cargar el tema desde localStorage al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  // Cambiar entre temas claro y oscuro
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    
    toast({
      title: `Tema ${newTheme === "light" ? "claro" : "oscuro"} activado`,
      description: "El cambio de tema se ha aplicado correctamente.",
    });
  };

  // Calcular estadísticas básicas
  const activeVehicles = vehicles.filter(v => v.status === "active").length;
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  const modules = [
    {
      title: "Vehículos",
      description: "Administra tu flota de vehículos",
      icon: <Car className="h-8 w-8 md:h-12 md:w-12 text-primary/80" />,
      route: "/vehicles",
      stat: `${activeVehicles} activos`,
    },
    {
      title: "Choferes",
      description: "Gestiona tus conductores",
      icon: <User className="h-8 w-8 md:h-12 md:w-12 text-primary/80" />,
      route: "/drivers",
      stat: "Personal",
    },
    {
      title: "Pagos",
      description: "Registra y consulta pagos",
      icon: <DollarSign className="h-8 w-8 md:h-12 md:w-12 text-primary/80" />,
      route: "/payments",
      stat: `${totalPayments} registros`,
    },
    {
      title: "Análisis de Pagos",
      description: "Visualiza y analiza tus ingresos",
      icon: <BarChart className="h-8 w-8 md:h-12 md:w-12 text-primary/80" />,
      route: "/payment-analysis",
      stat: `$${totalAmount.toFixed(2)} total`,
    },
    {
      title: "Calendario",
      description: "Programa mantenimientos y eventos",
      icon: <Calendar className="h-8 w-8 md:h-12 md:w-12 text-primary/80" />,
      route: "/calendar",
      stat: "Planificación",
    },
    {
      title: "Inversionistas",
      description: "Gestiona a los dueños de los vehículos",
      icon: <Users className="h-8 w-8 md:h-12 md:w-12 text-primary/80" />,
      route: "/investors",
      stat: "Colaboradores",
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col p-4 transition-colors dark:bg-gray-900">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full"
          aria-label={theme === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="text-center my-4 md:my-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 dark:text-white">Gestión de Flota TAXI SERVICE</h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-2 dark:text-gray-300">
          NIT: 9664233012 | Contacto: 60002611
        </p>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2 mt-2 dark:text-gray-300">
          Administra tu flota de vehículos, controla pagos, programa mantenimientos y más.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4 flex-grow">
        {modules.map((module) => (
          <Card 
            key={module.route} 
            className="flex flex-col hover:shadow-md transition-shadow dark:bg-gray-800 dark:text-white dark:border-gray-700 cursor-pointer"
            onClick={() => navigate(module.route)}
          >
            <CardHeader className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg md:text-xl dark:text-white">{module.title}</CardTitle>
                  <CardDescription className="mt-1 md:mt-2 text-xs md:text-sm dark:text-gray-400">{module.description}</CardDescription>
                </div>
                <div className="dark:text-gray-300">{module.icon}</div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-semibold text-primary mt-2 dark:text-gray-300">{module.stat}</div>
            </CardContent>
            <CardFooter className="p-4 md:p-6 pt-0 flex justify-end">
              <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center text-muted-foreground text-xs md:text-sm mt-6 md:mt-12 mb-4 md:mb-6 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Sistema de Gestión de Flota - Todos los derechos reservados</p>
      </div>
    </div>
  );
};

export default Index;
