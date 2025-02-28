
import { useApp } from "@/context/AppContext";
import VehicleCard from "./VehicleCard";

export const VehicleList = ({ onEdit, onDelete, onShowDetails }) => {
  const { vehicles } = useApp();
  
  console.log("Rendering VehicleList, vehicles:", vehicles);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vehicles && vehicles.length > 0 ? (
        vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onEdit={() => onEdit(vehicle)}
            onDelete={() => onDelete(vehicle)}
            onShowDetails={() => onShowDetails(vehicle)}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
          No hay vehículos registrados. Haga clic en "Agregar Vehículo" para comenzar.
        </div>
      )}
    </div>
  );
};

export default VehicleList;
