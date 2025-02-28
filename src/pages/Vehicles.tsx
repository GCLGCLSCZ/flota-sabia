
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Vehicle, Maintenance, InsurancePolicy, InsurancePayment } from "@/types";
import { VehiclesHeader } from "./components/VehiclesHeader";
import { VehicleList } from "./components/VehicleList";
import AddVehicleDialog from "./components/AddVehicleDialog";
import EditVehicleDialog from "./components/EditVehicleDialog";
import DeleteVehicleDialog from "./components/DeleteVehicleDialog";
import VehicleDetailsDialog from "./components/VehicleDetailsDialog";

const VehiclesPage = () => {
  const { updateVehicle, vehicles } = useApp();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleDelete = (vehicleId: string) => {
    updateVehicle(vehicleId, { status: "inactive" });
    setDeletingVehicle(null);
    toast({
      title: "Vehículo eliminado",
      description: "El vehículo ha sido eliminado exitosamente",
      variant: "destructive",
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
        onConfirm={(id) => handleDelete(id)}
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
