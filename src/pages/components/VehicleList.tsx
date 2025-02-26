
import { useApp } from "@/context/AppContext";
import VehicleCard from "./VehicleCard";

export const VehicleList = ({ onEdit, onDelete, onShowDetails }) => {
  const { vehicles } = useApp();

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
