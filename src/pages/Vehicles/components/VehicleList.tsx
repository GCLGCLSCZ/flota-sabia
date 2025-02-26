
import { Card } from "@/components/ui/card";
import { Vehicle } from "@/types";
import { Car, AlertCircle, Check } from "lucide-react";

interface VehicleListProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const VehicleList = ({ vehicles, onSelectVehicle }: VehicleListProps) => {
  const getStatusIcon = (status: Vehicle['status']) => {
    switch (status) {
      case 'active':
        return <Check className="text-success" />;
      case 'maintenance':
        return <AlertCircle className="text-warning" />;
      case 'inactive':
        return <AlertCircle className="text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {vehicles.map((vehicle) => (
        <Card
          key={vehicle.id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectVehicle(vehicle)}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{vehicle.plate}</h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(vehicle.status)}
                  <span className="text-sm text-gray-500 capitalize">
                    {vehicle.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
