
import { Card } from "@/components/ui/card";

interface Maintenance {
  plate: string;
  service: string;
  date: string;
}

interface MaintenanceCardProps {
  maintenances: Maintenance[];
}

export const MaintenanceCard = ({ maintenances }: MaintenanceCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Mantenimientos Próximos</h3>
      <div className="space-y-4">
        {maintenances.map((maintenance) => (
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
  );
};
