
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle } from "@/types";
import { useApp } from "@/context/AppContext";

interface EditVehicleDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const EditVehicleDialog = ({ vehicle, onClose }: EditVehicleDialogProps) => {
  const { updateVehicle } = useApp();

  if (!vehicle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVehicle(vehicle.id, vehicle);
    onClose();
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Vehículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-plate">Placa</Label>
              <Input
                id="edit-plate"
                value={vehicle.plate}
                onChange={(e) => updateVehicle(vehicle.id, { ...vehicle, plate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Marca</Label>
              <Input
                id="edit-brand"
                value={vehicle.brand}
                onChange={(e) => updateVehicle(vehicle.id, { ...vehicle, brand: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Modelo</Label>
              <Input
                id="edit-model"
                value={vehicle.model}
                onChange={(e) => updateVehicle(vehicle.id, { ...vehicle, model: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-year">Año</Label>
              <Input
                id="edit-year"
                value={vehicle.year}
                onChange={(e) => updateVehicle(vehicle.id, { ...vehicle, year: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <Select
                value={vehicle.status}
                onValueChange={(value: "active" | "maintenance" | "inactive") =>
                  updateVehicle(vehicle.id, { ...vehicle, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="maintenance">En Mantenimiento</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-investor">Inversor</Label>
              <Input
                id="edit-investor"
                value={vehicle.investor}
                onChange={(e) => updateVehicle(vehicle.id, { ...vehicle, investor: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVehicleDialog;
