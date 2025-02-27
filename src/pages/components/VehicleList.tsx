
import { useApp } from "@/context/AppContext";
import VehicleCard from "./VehicleCard";

interface VehicleListProps {
  onEdit: (vehicle: any) => void;
  onDelete: (vehicle: any) => void;
  onShowDetails: (vehicle: any) => void;
}

export const VehicleList = ({ onEdit, onDelete, onShowDetails }: VehicleListProps) => {
  const { vehicles } = useApp();

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No hay vehículos registrados</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onEdit={() => onEdit(vehicle)}
          onDelete={() => onDelete(vehicle)}
          onShowDetails={() => onShowDetails(vehicle)}
        />
      ))}
    </div>
  );
};
