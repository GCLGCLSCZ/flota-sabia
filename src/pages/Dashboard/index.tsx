
import { Car, Users, AlertCircle, DollarSign } from "lucide-react";
import { StatCard } from "./components/StatCard";
import { LatePaymentsCard } from "./components/LatePaymentsCard";
import { MaintenanceCard } from "./components/MaintenanceCard";

const Dashboard = () => {
  const stats = [
    {
      label: "Total Vehículos",
      value: "12",
      icon: Car,
      change: "+2 este mes",
      color: "text-primary",
    },
    {
      label: "Inversores Activos",
      value: "8",
      icon: Users,
      change: "100% activos",
      color: "text-success",
    },
    {
      label: "Pagos Pendientes",
      value: "3",
      icon: AlertCircle,
      change: "-2 última semana",
      color: "text-warning",
    },
    {
      label: "Ingresos del Mes",
      value: "Bs 15,420",
      icon: DollarSign,
      change: "+12% vs mes anterior",
      color: "text-success",
    },
  ];

  const latePayments = [
    { plate: "ABC-123", days: 12, amount: "Bs 1,200" },
    { plate: "XYZ-789", days: 15, amount: "Bs 1,500" },
  ];

  const upcomingMaintenance = [
    {
      plate: "DEF-456",
      service: "Cambio de aceite",
      date: "En 3 días",
    },
    {
      plate: "GHI-789",
      service: "Rotación de llantas",
      date: "En 5 días",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatePaymentsCard payments={latePayments} />
        <MaintenanceCard maintenances={upcomingMaintenance} />
      </div>
    </div>
  );
};

export default Dashboard;
