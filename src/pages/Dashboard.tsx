
import { Card } from "@/components/ui/card";
import { Car, Users, AlertCircle, DollarSign } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useMemo } from "react";

const Dashboard = () => {
  const { vehicles, investors, payments } = useApp();

  // Cálculo de estadísticas en tiempo real
  const statistics = useMemo(() => {
    const activeVehicles = vehicles.filter(v => v.status === "active");
    const activeInvestors = investors.filter(i => i.status === "active");
    const pendingPayments = payments.filter(p => p.status === "pending");
    
    // Cálculo de ingresos del mes actual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyPayments = payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear &&
             p.status === "completed";
    });
    
    const monthlyIncome = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    
    return {
      vehicles: activeVehicles.length,
      investors: activeInvestors.length,
      pendingPayments: pendingPayments.length,
      monthlyIncome
    };
  }, [vehicles, investors, payments]);

  const stats = [
    {
      label: "Total Vehículos",
      value: statistics.vehicles.toString(),
      icon: Car,
      change: `${vehicles.length - statistics.vehicles} en mantenimiento`,
      color: "text-primary",
    },
    {
      label: "Inversores Activos",
      value: statistics.investors.toString(),
      icon: Users,
      change: `${investors.length > 0 ? (statistics.investors / investors.length * 100).toFixed(0) : 0}% activos`,
      color: "text-success",
    },
    {
      label: "Pagos Pendientes",
      value: statistics.pendingPayments.toString(),
      icon: AlertCircle,
      change: `${payments.filter(p => p.status === "completed").length} completados`,
      color: "text-warning",
    },
    {
      label: "Ingresos del Mes",
      value: `Bs ${statistics.monthlyIncome.toLocaleString()}`,
      icon: DollarSign,
      change: "Mes actual",
      color: "text-success",
    },
  ];

  // Obtener vehículos con pagos atrasados
  const vehiclesWithLatePayments = useMemo(() => {
    const today = new Date();
    return vehicles
      .filter(vehicle => {
        const vehiclePayments = payments.filter(p => p.vehicleId === vehicle.id);
        const lastPayment = vehiclePayments.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        
        if (!lastPayment) return true;
        
        const daysSinceLastPayment = Math.floor(
          (today.getTime() - new Date(lastPayment.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return daysSinceLastPayment > 30;
      })
      .slice(0, 2);
  }, [vehicles, payments]);

  // Obtener próximos mantenimientos
  const upcomingMaintenance = useMemo(() => {
    return vehicles
      .filter(vehicle => vehicle.nextMaintenance)
      .sort((a, b) => {
        const dateA = new Date(a.nextMaintenance || "");
        const dateB = new Date(b.nextMaintenance || "");
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 2)
      .map(vehicle => ({
        plate: vehicle.plate,
        service: "Mantenimiento Programado",
        date: new Date(vehicle.nextMaintenance || ""),
      }));
  }, [vehicles]);

  return (
    <div className="w-full pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 hover:shadow-md transition-shadow dark:bg-gray-800 dark:text-white overflow-visible">
            <div className="flex items-start justify-between">
              <div className="w-3/4 overflow-visible">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">{stat.label}</p>
                <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{stat.change}</p>
              </div>
              <div className={`${stat.color} bg-gray-50 dark:bg-gray-700 p-2 rounded-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 dark:bg-gray-800 dark:text-white">
          <h3 className="text-lg font-semibold mb-4">Vehículos con Pagos Atrasados</h3>
          <div className="space-y-4">
            {vehiclesWithLatePayments.length > 0 ? vehiclesWithLatePayments.map((vehicle) => {
              const lastPayment = payments
                .filter(p => p.vehicleId === vehicle.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              
              const daysSinceLastPayment = Math.floor(
                (new Date().getTime() - new Date(lastPayment?.date || 0).getTime()) / 
                (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{vehicle.plate}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {daysSinceLastPayment} días de atraso
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-warning">
                      Bs {vehicle.dailyRate * daysSinceLastPayment}
                    </p>
                    <button className="text-xs text-primary hover:underline dark:text-blue-400">
                      Ver detalles
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">No hay vehículos con pagos atrasados</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 dark:bg-gray-800 dark:text-white">
          <h3 className="text-lg font-semibold mb-4">Mantenimientos Próximos</h3>
          <div className="space-y-4">
            {upcomingMaintenance.length > 0 ? upcomingMaintenance.map((maintenance) => {
              const daysUntilMaintenance = Math.ceil(
                (maintenance.date.getTime() - new Date().getTime()) / 
                (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={maintenance.plate}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{maintenance.plate}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{maintenance.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-600 dark:text-gray-300">
                      En {daysUntilMaintenance} días
                    </p>
                    <button className="text-xs text-primary hover:underline dark:text-blue-400">
                      Programar
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">No hay mantenimientos programados</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
