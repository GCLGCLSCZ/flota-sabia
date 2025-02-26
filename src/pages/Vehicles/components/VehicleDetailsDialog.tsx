
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Vehicle, Maintenance } from "@/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onAddMaintenance: (vehicleId: string, maintenance: Omit<Maintenance, "id" | "status">) => void;
}

export const VehicleDetailsDialog = ({
  vehicle,
  onClose,
  onAddMaintenance,
}: VehicleDetailsDialogProps) => {
  const [newMaintenance, setNewMaintenance] = useState({
    date: "",
    description: "",
    costMaterials: 0,
    salePrice: 0,
  });

  if (!vehicle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMaintenance(vehicle.id, newMaintenance);
    setNewMaintenance({
      date: "",
      description: "",
      costMaterials: 0,
      salePrice: 0,
    });
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalles del Vehículo</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Historial de Mantenimientos</h3>
            <div className="space-y-4">
              {vehicle.maintenanceHistory?.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{maintenance.description}</p>
                    <p className="text-sm text-muted-foreground">{maintenance.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      Ganancia: Bs {maintenance.salePrice - maintenance.costMaterials}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenance-date">Fecha</Label>
                  <Input
                    id="maintenance-date"
                    type="date"
                    value={newMaintenance.date}
                    onChange={(e) =>
                      setNewMaintenance({
                        ...newMaintenance,
                        date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-description">Descripción</Label>
                  <Input
                    id="maintenance-description"
                    value={newMaintenance.description}
                    onChange={(e) =>
                      setNewMaintenance({
                        ...newMaintenance,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-cost">Costo de Materiales (Bs)</Label>
                  <Input
                    id="maintenance-cost"
                    type="number"
                    value={newMaintenance.costMaterials}
                    onChange={(e) =>
                      setNewMaintenance({
                        ...newMaintenance,
                        costMaterials: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-price">Precio de Venta (Bs)</Label>
                  <Input
                    id="maintenance-price"
                    type="number"
                    value={newMaintenance.salePrice}
                    onChange={(e) =>
                      setNewMaintenance({
                        ...newMaintenance,
                        salePrice: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Agregar Mantenimiento</Button>
              </div>
            </form>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Días No Trabajados</h3>
            <div className="space-y-4">
              {vehicle.daysNotWorked?.map((day) => (
                <div
                  key={day}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <p className="font-medium">{day}</p>
                  <Button variant="ghost" size="icon">
                    <span className="sr-only">Eliminar</span>
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
