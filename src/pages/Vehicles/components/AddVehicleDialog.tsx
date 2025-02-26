
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";

interface AddVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVehicleDialog = ({ isOpen, onClose }: AddVehicleDialogProps) => {
  const { addVehicle } = useApp();
  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
    investor: "",
    dailyRate: 21,
    driverName: "",
    driverPhone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = addVehicle({
      ...newVehicle,
      status: "active",
      monthlyEarnings: newVehicle.dailyRate * 30,
      maintenanceHistory: [],
      daysNotWorked: [],
      driverName: newVehicle.driverName,
      driverPhone: newVehicle.driverPhone,
    });

    if (success) {
      setNewVehicle({
        plate: "",
        brand: "",
        model: "",
        year: "",
        investor: "",
        dailyRate: 21,
        driverName: "",
        driverPhone: "",
      });
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
                value={newVehicle.plate}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, plate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={newVehicle.brand}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, brand: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={newVehicle.model}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, model: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                value={newVehicle.year}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, year: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investor">Inversor</Label>
              <Input
                id="investor"
                value={newVehicle.investor}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, investor: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyRate">Tarifa Diaria (Bs)</Label>
              <Input
                id="dailyRate"
                type="number"
                value={newVehicle.dailyRate}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    dailyRate: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverName">Nombre del Conductor</Label>
              <Input
                id="driverName"
                value={newVehicle.driverName}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    driverName: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverPhone">Teléfono del Conductor</Label>
              <Input
                id="driverPhone"
                value={newVehicle.driverPhone}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    driverPhone: e.target.value,
                  })
                }
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
