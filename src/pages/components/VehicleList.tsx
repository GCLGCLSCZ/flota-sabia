
import { memo, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import VehicleCard from "./VehicleCard";

interface VehicleListProps {
  onEdit: (vehicle: any) => void;
  onDelete: (vehicle: any) => void;
  onShowDetails: (vehicle: any) => void;
  searchQuery?: string;
  filterStatus?: string;
}

// MemoizedVehicleCard para evitar re-renderizados innecesarios
const MemoizedVehicleCard = memo(VehicleCard);

export const VehicleList = ({ 
  onEdit, 
  onDelete, 
  onShowDetails, 
  searchQuery = '', 
  filterStatus = 'all' 
}: VehicleListProps) => {
  const { vehicles } = useApp();

  // Filtramos y ordenamos vehículos solo cuando cambian las dependencias
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(vehicle => {
        // Filtro por búsqueda (en placa, marca o modelo)
        const matchesSearch = searchQuery === '' || 
          vehicle.plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.model?.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filtro por estado
        const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Ordenar por estado (activos primero) y luego por placa
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return a.plate.localeCompare(b.plate);
      });
  }, [vehicles, searchQuery, filterStatus]);

  if (filteredVehicles.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 bg-gray-50 rounded-lg dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No se encontraron vehículos que coincidan con los criterios de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredVehicles.map((vehicle) => (
        <MemoizedVehicleCard
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

export default memo(VehicleList);
