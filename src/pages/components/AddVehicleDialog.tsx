
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Vehicle } from "@/types";

interface AddVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddVehicleDialog = ({ isOpen, onClose }: AddVehicleDialogProps) => {
  const { addVehicle, investors, drivers } = useApp();
  const [formData, setFormData] = useState<Omit<Vehicle, "id">>({
    plate: "",
    brand: "",
    model: "",
    year: "",
    status: "active" as const,
    investor: "",
    dailyRate: 0,
    driverName: "",
    driverPhone: "",
    driverId: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.investor) {
      return; // No permitir enviar si no hay inversor seleccionado
    }
    const success = addVehicle(formData);
    if (success) {
      onClose();
    }
  };

  const handleDriverSelect = (driverId: string) => {
    const selectedDriver = drivers.find(d => d.id === driverId);
    if (selectedDriver) {
      setFormData({
        ...formData,
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
        driverPhone: selectedDriver.phone,
      });
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
            <div className="space-y-2 col-span-2">
              <Label htmlFor="investor">Inversor</Label>
              <Select 
                value={formData.investor} 
                onValueChange={(value) => setFormData({ ...formData, investor: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un inversor" />
                </SelectTrigger>
                <SelectContent>
                  {investors.map((investor) => (
                    <SelectItem key={investor.id} value={investor.name}>
                      {investor.name} - {investor.documentId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {investors.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Debes agregar inversores antes de poder registrar un vehículo
                </p>
              )}
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
            <div className="space-y-2 col-span-2">
              <Label htmlFor="driver">Conductor (Opcional)</Label>
              <Select 
                value={formData.driverId || ""} 
                onValueChange={handleDriverSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un conductor (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} - {driver.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {drivers.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  No hay conductores registrados. Puedes asignar uno más tarde.
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button 
              type="submit"
              disabled={!formData.investor || investors.length === 0}
            >
              Guardar Vehículo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;
