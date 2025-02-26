
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

interface AddVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddVehicleDialog = ({ isOpen, onClose }: AddVehicleDialogProps) => {
  const { addVehicle } = useApp();
  const [formData, setFormData] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
    status: "active",
    investor: "",
    dailyRate: 0,
    driverName: "",
    driverPhone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = addVehicle(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa</Label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investor">Inversor</Label>
              <Input
                id="investor"
                value={formData.investor}
                onChange={(e) => setFormData({ ...formData, investor: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyRate">Tarifa Diaria</Label>
              <Input
                id="dailyRate"
                type="number"
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverName">Nombre del Conductor</Label>
              <Input
                id="driverName"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverPhone">Teléfono del Conductor</Label>
              <Input
                id="driverPhone"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="submit">Guardar Vehículo</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;
