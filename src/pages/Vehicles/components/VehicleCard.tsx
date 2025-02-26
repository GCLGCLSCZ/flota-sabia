
import { Vehicle } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Edit, Trash2 } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onShowDetails: (vehicle: Vehicle) => void;
}

export const VehicleCard = ({ vehicle, onEdit, onDelete, onShowDetails }: VehicleCardProps) => {
  const statusColors = {
    active: "text-success bg-success/10",
    maintenance: "text-warning bg-warning/10",
    inactive: "text-destructive bg-destructive/10",
  };

  const statusLabels = {
    active: "Activo",
    maintenance: "En Mantenimiento",
    inactive: "Inactivo",
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{vehicle.plate}</h3>
          <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[vehicle.status]}`}>
              {statusLabels[vehicle.status]}
            </span>
          </div>
        </div>
        <div className="space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onShowDetails(vehicle)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(vehicle)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(vehicle)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
