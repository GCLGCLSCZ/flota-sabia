
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Vehicle, Maintenance } from "@/types";
import { VehiclesHeader } from "./components/VehiclesHeader";
import { VehicleList } from "./components/VehicleList";
import AddVehicleDialog from "./components/AddVehicleDialog";
import EditVehicleDialog from "./components/EditVehicleDialog";
import DeleteVehicleDialog from "./components/DeleteVehicleDialog";
import VehicleDetailsDialog from "./components/VehicleDetailsDialog";

const VehiclesPage = () => {
  const { updateVehicle, vehicles, refreshData } = useApp();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleDelete = async (vehicleId: string) => {
    try {
      // Cambiamos el estado a inactivo
      const success = await updateVehicle(vehicleId, { status: "inactive" });
      
      if (success) {
        setDeletingVehicle(null);
        // Refrescar datos para actualizar la UI
        await refreshData();
        
        toast({
          title: "Vehículo eliminado",
          description: "El vehículo ha sido marcado como inactivo exitosamente",
        });
      } else {
        throw new Error("No se pudo actualizar el vehículo");
      }
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el vehículo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleAddMaintenance = (
    vehicleId: string,
    maintenance: Omit<Maintenance, "id" | "status" | "vehicleId">
  ) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Asegurar que el costo total sea la suma de materiales y mano de obra
    const totalCost = maintenance.costMaterials + maintenance.costLabor;
    
    const maintenanceData = {
      id: Date.now().toString(),
      vehicleId,
      ...maintenance,
      cost: totalCost,
      status: "pending" as const,
    };
    
    const updatedMaintenance = [
      ...(vehicle.maintenanceHistory || []),
      maintenanceData,
    ];
    
    updateVehicle(vehicleId, {
      maintenanceHistory: updatedMaintenance,
    });
    
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
        onConfirm={handleDelete}
        onClose={() => setDeletingVehicle(null)}
      />

      <VehicleDetailsDialog
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onAddMaintenance={handleAddMaintenance}
      />
    </div>
  );
};

export default VehiclesPage;
