
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, DollarSign, Calendar, BarChart, Users, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { vehicles, payments } = useApp();

  // Calcular estadísticas básicas
  const activeVehicles = vehicles.filter(v => v.status === "active").length;
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  const modules = [
    {
      title: "Vehículos",
      description: "Administra tu flota de vehículos",
      icon: <Car className="h-12 w-12 text-primary/80" />,
      route: "/vehicles",
      stat: `${activeVehicles} activos`,
    },
    {
      title: "Pagos",
      description: "Registra y consulta pagos",
      icon: <DollarSign className="h-12 w-12 text-primary/80" />,
      route: "/payments",
      stat: `${totalPayments} registros`,
    },
    {
      title: "Análisis de Pagos",
      description: "Visualiza y analiza tus ingresos",
      icon: <BarChart className="h-12 w-12 text-primary/80" />,
      route: "/payment-analysis",
      stat: `$${totalAmount.toFixed(2)} total`,
    },
    {
      title: "Calendario",
      description: "Programa mantenimientos y eventos",
      icon: <Calendar className="h-12 w-12 text-primary/80" />,
      route: "/calendar",
      stat: "Planificación",
    },
    {
      title: "Inversionistas",
      description: "Gestiona a los dueños de los vehículos",
      icon: <Users className="h-12 w-12 text-primary/80" />,
      route: "/investors",
      stat: "Colaboradores",
    },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="text-center my-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Sistema de Gestión de Flota</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Administra tu flota de vehículos, controla pagos, programa mantenimientos y más.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 flex-grow">
        {modules.map((module) => (
          <Card key={module.route} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription className="mt-2">{module.description}</CardDescription>
                </div>
                <div>{module.icon}</div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-2xl font-semibold text-primary mt-2">{module.stat}</div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full justify-between" 
                onClick={() => navigate(module.route)}
              >
                <span>Ir al módulo</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center text-muted-foreground mt-12 mb-6">
        <p>© {new Date().getFullYear()} Sistema de Gestión de Flota - Todos los derechos reservados</p>
      </div>
    </div>
  );
};

export default Index;
