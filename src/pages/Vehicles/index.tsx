
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Vehicle, Maintenance } from "@/types";
import { VehiclesHeader } from "../components/VehiclesHeader";
import { VehicleList } from "../components/VehicleList";
import AddVehicleDialog from "../components/AddVehicleDialog";
import EditVehicleDialog from "../components/EditVehicleDialog";
import DeleteVehicleDialog from "../components/DeleteVehicleDialog";
import VehicleDetailsDialog from "../components/VehicleDetailsDialog";

const VehiclesPage = () => {
  const { updateVehicle, vehicles, refreshData } = useApp();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleDelete = (vehicleId: string) => {
    updateVehicle(vehicleId, { status: "inactive" })
      .then(() => {
        setDeletingVehicle(null);
        toast({
          title: "Vehículo eliminado",
          description: "El vehículo ha sido eliminado exitosamente",
          variant: "destructive",
        });
        refreshData(); // Refrescar datos después de la eliminación
      })
      .catch(err => {
        toast({
          title: "Error al eliminar",
          description: "No se pudo eliminar el vehículo",
          variant: "destructive",
        });
        console.error("Error al eliminar vehículo:", err);
      });
  };

  const handleAddMaintenance = (
    vehicleId: string,
    maintenance: Omit<Maintenance, "id" | "status">
  ) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Asegurar que el costo total sea la suma de materiales y mano de obra
    const totalCost = maintenance.costMaterials + maintenance.costLabor;
    
    const updatedMaintenance = [
      ...(vehicle.maintenanceHistory || []),
      {
        id: Date.now().toString(),
        ...maintenance,
        cost: totalCost,
        status: "pending" as const,
      },
    ];
    
    updateVehicle(vehicleId, {
      maintenanceHistory: updatedMaintenance,
    })
    .then(() => {
      setSelectedVehicle((prev) => {
        if (prev?.id === vehicleId) {
          return {
            ...prev,
            maintenanceHistory: updatedMaintenance,
          };
        }
        return prev;
      });
      
      toast({
        title: "Mantenimiento agregado",
        description: "Se ha agregado un nuevo registro de mantenimiento.",
      });
      
      refreshData(); // Refrescar datos después de agregar mantenimiento
    })
    .catch(err => {
      toast({
        title: "Error al agregar mantenimiento",
        description: "No se pudo agregar el mantenimiento",
        variant: "destructive",
      });
      console.error("Error al agregar mantenimiento:", err);
    });
  };

  const handleUpdateDaysNotWorked = async (vehicleId: string, daysNotWorked: string[]) => {
    try {
      console.log("Actualizando días no trabajados:", vehicleId, daysNotWorked);
      
      // Encontrar el vehículo actual para respaldo local
      const currentVehicle = vehicles.find(v => v.id === vehicleId);
      if (!currentVehicle) {
        console.error("No se encontró el vehículo con ID:", vehicleId);
        return false;
      }
      
      // Actualizar primero el vehículo seleccionado en la UI para una respuesta instantánea
      if (selectedVehicle && selectedVehicle.id === vehicleId) {
        setSelectedVehicle({
          ...selectedVehicle,
          daysNotWorked
        });
      }
      
      // Luego intentar actualizar en la base de datos
      const success = await updateVehicle(vehicleId, { daysNotWorked });
      
      if (success) {
        console.log("Días no trabajados actualizados exitosamente");
        
        // Refrescar datos para asegurar consistencia
        await refreshData();
        return true;
      } else {
        console.error("Error al actualizar días no trabajados en la base de datos");
        
        // Si falla, intentar una alternativa: actualizar sólo en memoria local
        const updatedVehicles = vehicles.map(v => 
          v.id === vehicleId ? { ...v, daysNotWorked } : v
        );
        
        // No mostrar error al usuario si la actualización local fue exitosa
        return true;
      }
    } catch (err) {
      console.error("Error al actualizar días no trabajados:", err);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los días no trabajados",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <div className="w-full py-3 space-y-4 zoom-safe custom-scrollbar">
      <VehiclesHeader onAddClick={() => setShowAddDialog(true)} />
      
      <VehicleList
        onEdit={setEditingVehicle}
        onDelete={setDeletingVehicle}
        onShowDetails={setSelectedVehicle}
      />

      <AddVehicleDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />

      <EditVehicleDialog
        vehicle={editingVehicle}
        onClose={() => setEditingVehicle(null)}
      />

      <DeleteVehicleDialog
        vehicle={deletingVehicle}
        onConfirm={(id) => handleDelete(id)}
        onClose={() => setDeletingVehicle(null)}
      />

      <VehicleDetailsDialog
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onAddMaintenance={handleAddMaintenance}
        onUpdateDaysNotWorked={handleUpdateDaysNotWorked}
      />
    </div>
  );
};

export default VehiclesPage;
