
import { useApp } from "@/context/AppContext";
import VehicleCard from "./VehicleCard";
import { useState } from "react";

export const VehicleList = ({ onEdit, onDelete, onShowDetails }) => {
  const { vehicles } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtrar vehículos por placa, modelo o inversionista
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.investor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por placa, modelo o inversionista..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onEdit={() => onEdit(vehicle)}
            onDelete={() => onDelete(vehicle)}
            onShowDetails={() => onShowDetails(vehicle)}
          />
        ))}
        
        {filteredVehicles.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No se encontraron vehículos que coincidan con su búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleList;
