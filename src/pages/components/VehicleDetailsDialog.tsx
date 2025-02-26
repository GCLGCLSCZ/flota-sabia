
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Vehicle, Maintenance } from "@/types";
import { Card } from "@/components/ui/card";

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onAddMaintenance: (vehicleId: string, maintenance: Omit<Maintenance, "id" | "status">) => void;
}

const VehicleDetailsDialog = ({ vehicle, onClose, onAddMaintenance }: VehicleDetailsDialogProps) => {
  if (!vehicle) return null;

  const statusColors = {
    active: "text-success bg-success/10",
    maintenance: "text-warning bg-warning/10",
    inactive: "text-destructive bg-destructive/10",
    completed: "text-success bg-success/10",
    pending: "text-warning bg-warning/10",
  };

  const statusLabels = {
    active: "Activo",
    maintenance: "En Mantenimiento",
    inactive: "Inactivo",
    completed: "Completado",
    pending: "Pendiente",
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalles del Vehículo</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Información General</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Placa</p>
                <p className="font-medium">{vehicle.plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Marca y Modelo</p>
                <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Año</p>
                <p className="font-medium">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[vehicle.status]}`}>
                  {statusLabels[vehicle.status]}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Inversor</p>
                <p className="font-medium">{vehicle.investor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tarifa Diaria</p>
                <p className="font-medium">Bs. {vehicle.dailyRate}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Historial de Mantenimiento</h3>
              <Button onClick={() => onAddMaintenance(vehicle.id, {
                date: new Date().toISOString(),
                description: "",
                costMaterials: 0,
                salePrice: 0,
              })}>
                Agregar Mantenimiento
              </Button>
            </div>
            <div className="space-y-4">
              {vehicle.maintenanceHistory?.map((maintenance) => (
                <div key={maintenance.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{maintenance.description}</p>
                      <p className="text-sm text-gray-500">
                        Fecha: {new Date(maintenance.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[maintenance.status]}`}>
                      {statusLabels[maintenance.status]}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Costo de Materiales</p>
                      <p className="font-medium">Bs. {maintenance.costMaterials}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Precio de Venta</p>
                      <p className="font-medium">Bs. {maintenance.salePrice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
