
import { Card } from "@/components/ui/card";
import { Car, Users, AlertCircle, DollarSign } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} bg-gray-50 p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vehículos con Pagos Atrasados</h3>
          <div className="space-y-4">
            {[
              { plate: "ABC-123", days: 12, amount: "Bs 1,200" },
              { plate: "XYZ-789", days: 15, amount: "Bs 1,500" },
            ].map((vehicle) => (
              <div
                key={vehicle.plate}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{vehicle.plate}</p>
                  <p className="text-sm text-gray-600">
                    {vehicle.days} días de atraso
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-warning">{vehicle.amount}</p>
                  <button className="text-sm text-primary hover:underline">
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Mantenimientos Próximos</h3>
          <div className="space-y-4">
            {[
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
            ].map((maintenance) => (
              <div
                key={maintenance.plate}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{maintenance.plate}</p>
                  <p className="text-sm text-gray-600">{maintenance.service}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-600">{maintenance.date}</p>
                  <button className="text-sm text-primary hover:underline">
                    Programar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
