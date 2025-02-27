
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/use-toast";
import { Vehicle, Maintenance } from "@/types";
import { VehiclesHeader } from "./components/VehiclesHeader";
import { VehicleList } from "./components/VehicleList";
import AddVehicleDialog from "./components/AddVehicleDialog";
import EditVehicleDialog from "./components/EditVehicleDialog";
import DeleteVehicleDialog from "./components/DeleteVehicleDialog";
import VehicleDetailsDialog from "./components/VehicleDetailsDialog";

const VehiclesPage = () => {
  const { updateVehicle } = useApp();
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
    updateVehicle(vehicleId, {
      maintenanceHistory: [
        ...(selectedVehicle?.maintenanceHistory || []),
        {
          id: Date.now().toString(),
          ...maintenance,
          status: "pending",
        },
      ],
    });
    setSelectedVehicle((prev) =>
      prev?.id === vehicleId
        ? {
            ...prev,
            maintenanceHistory: [
              ...(prev.maintenanceHistory || []),
              {
                id: Date.now().toString(),
                ...maintenance,
                status: "pending",
              },
            ],
          }
        : prev
    );
    toast({
      title: "Mantenimiento agregado",
      description: "Se ha agregado un nuevo registro de mantenimiento.",
    });
  };

  return (
    <div className="w-full py-3 space-y-4 zoom-safe">
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
