import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle } from "@/types";
import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";

interface EditVehicleDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const EditVehicleDialog = ({ vehicle, onClose }: EditVehicleDialogProps) => {
  const { updateVehicle, drivers, investors } = useApp();
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (vehicle) {
      setEditedVehicle({ ...vehicle });
    }
  }, [vehicle]);

  if (!vehicle || !editedVehicle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVehicle(vehicle.id, editedVehicle);
    onClose();
  };

  const handleDriverSelect = (driverId: string) => {
    if (driverId === "none") {
      setEditedVehicle({
        ...editedVehicle,
        driverId: undefined,
        driverName: "",
        driverPhone: ""
      });
      return;
    }
    
    const selectedDriver = drivers.find(d => d.id === driverId);
    if (selectedDriver) {
      setEditedVehicle({
        ...editedVehicle,
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
        driverPhone: selectedDriver.phone || ""
      });
    }
  };

  const handleInvestorSelect = (investorName: string) => {
    if (investorName === "none") {
      setEditedVehicle({
        ...editedVehicle,
        investor: ""
      });
      return;
    }
    
    const selectedInvestor = investors.find(i => i.name === investorName);
    if (selectedInvestor) {
      setEditedVehicle({
        ...editedVehicle,
        investor: selectedInvestor.name
      });
    } else {
      setEditedVehicle({
        ...editedVehicle,
        investor: investorName
      });
    }
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Vehículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-plate">Placa</Label>
              <Input
                id="edit-plate"
                value={editedVehicle.plate}
                onChange={(e) => setEditedVehicle({...editedVehicle, plate: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Marca</Label>
              <Input
                id="edit-brand"
                value={editedVehicle.brand}
                onChange={(e) => setEditedVehicle({...editedVehicle, brand: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Modelo</Label>
              <Input
                id="edit-model"
                value={editedVehicle.model}
                onChange={(e) => setEditedVehicle({...editedVehicle, model: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-year">Año</Label>
              <Input
                id="edit-year"
                value={editedVehicle.year}
                onChange={(e) => setEditedVehicle({...editedVehicle, year: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <Select
                value={editedVehicle.status}
                onValueChange={(value: "active" | "maintenance" | "inactive") =>
                  setEditedVehicle({...editedVehicle, status: value})
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
              <Label htmlFor="edit-dailyRate">Comisión por Administración (Bs)</Label>
              <Input
                id="edit-dailyRate"
                type="number"
                value={editedVehicle.dailyRate}
                onChange={(e) => setEditedVehicle({...editedVehicle, dailyRate: Number(e.target.value)})}
                required
              />
              <p className="text-sm text-muted-foreground">
                Comisión diaria que se cobra por la administración del vehículo
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-installmentAmount">Renta Diaria (Bs)</Label>
              <Input
                id="edit-installmentAmount"
                type="number"
                value={editedVehicle.installmentAmount || 0}
                onChange={(e) => setEditedVehicle({...editedVehicle, installmentAmount: Number(e.target.value)})}
                required
              />
              <p className="text-sm text-muted-foreground">
                Monto diario que debe pagar el conductor por el vehículo
              </p>
            </div>
            
            {/* Campos de contrato */}
            <div className="space-y-2">
              <Label htmlFor="edit-contractStartDate">Fecha de inicio del contrato</Label>
              <Input
                id="edit-contractStartDate"
                type="date"
                value={editedVehicle.contractStartDate || ""}
                onChange={(e) => setEditedVehicle({...editedVehicle, contractStartDate: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-totalInstallments">Número total de cuotas</Label>
              <Input
                id="edit-totalInstallments"
                type="number"
                value={editedVehicle.totalInstallments || 0}
                onChange={(e) => setEditedVehicle({...editedVehicle, totalInstallments: Number(e.target.value)})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-installmentAmount">Monto por cuota (Bs)</Label>
              <Input
                id="edit-installmentAmount"
                type="number"
                value={editedVehicle.installmentAmount || 0}
                onChange={(e) => setEditedVehicle({...editedVehicle, installmentAmount: Number(e.target.value)})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-paidInstallments">Cuotas pagadas</Label>
              <Input
                id="edit-paidInstallments"
                type="number"
                value={editedVehicle.paidInstallments || 0}
                onChange={(e) => setEditedVehicle({...editedVehicle, paidInstallments: Number(e.target.value)})}
                required
              />
            </div>

            {/* Selector de Inversionista */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-investor">Inversionista</Label>
              <Select
                value={editedVehicle.investor || "none"}
                onValueChange={handleInvestorSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar inversionista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {investors.map((investor) => (
                    <SelectItem key={investor.id} value={investor.name}>
                      {investor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Conductor */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-driver">Conductor</Label>
              <Select
                value={editedVehicle.driverId || "none"}
                onValueChange={handleDriverSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar conductor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} - {driver.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editedVehicle.driverName && (
                <p className="text-xs text-muted-foreground mt-1">
                  Conductor asignado: {editedVehicle.driverName}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVehicleDialog;
