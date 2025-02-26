
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, Car, CalendarClock, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Vehicle, Payment, Investor } from "@/types";

const Vehicles = () => {
  const { vehicles, setVehicles } = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(vehicles.filter((v) => v.id !== vehicleId));
    setShowDeleteDialog(false);
  };

  const handleAddMaintenance = (
    vehicleId: string,
    maintenance: Omit<Maintenance, "id" | "status">
  ) => {
    setVehicles(
      vehicles.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              maintenanceHistory: [
                ...(vehicle.maintenanceHistory || []),
                {
                  id: Date.now().toString(),
                  ...maintenance,
                  status: "pending",
                },
              ],
            }
          : vehicle
      )
    );
    setShowDetails(false);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.investor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de Vehículos</h1>
          <p className="text-muted-foreground mt-1">
            Administra los vehículos y sus mantenimientos
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Vehículo
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Buscar por placa, marca, modelo o inversor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onEdit={() => setEditingVehicle(vehicle)}
            onDelete={() => {
              setSelectedVehicle(vehicle);
              setShowDeleteDialog(true);
            }}
            onShowDetails={() => {
              setSelectedVehicle(vehicle);
              setShowDetails(true);
            }}
          />
        ))}
      </div>

      <AddVehicleDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />

      <EditVehicleDialog
        vehicle={editingVehicle}
        onClose={() => setEditingVehicle(null)}
      />

      <DeleteVehicleDialog
        vehicle={showDeleteDialog ? selectedVehicle : null}
        onConfirm={handleDeleteVehicle}
        onClose={() => setShowDeleteDialog(false)}
      />

      <VehicleDetailsDialog
        vehicle={showDetails ? selectedVehicle : null}
        onClose={() => setShowDetails(false)}
        onAddMaintenance={handleAddMaintenance}
      />
    </div>
  );
};

export default Vehicles;
