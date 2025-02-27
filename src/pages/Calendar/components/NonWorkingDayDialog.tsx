
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { NonWorkingDayDialogProps, NonWorkingDay } from "../types";

const NonWorkingDayDialog = ({
  open,
  onOpenChange,
  selectedDates,
  setSelectedDates,
  newNonWorkingDay,
  setNewNonWorkingDay,
  applyToAllVehicles,
  setApplyToAllVehicles,
  selectedVehicle,
  setSelectedVehicle,
  vehicles,
  updateVehicle,
  toast
}: NonWorkingDayDialogProps) => {
  
  const handleAddNonWorkingDays = () => {
    if (!selectedDates?.from || !selectedDates?.to || (!selectedVehicle && !applyToAllVehicles)) return;

    const daysToAdd = {
      date: selectedDates.from,
      ...newNonWorkingDay,
    };

    if (applyToAllVehicles) {
      vehicles.forEach((vehicle) => {
        const currentDaysOff = vehicle.daysNotWorked || [];
        updateVehicle(vehicle.id, {
          daysNotWorked: [...currentDaysOff, selectedDates.from.toISOString()]
        });
      });
    } else {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      if (vehicle) {
        const currentDaysOff = vehicle.daysNotWorked || [];
        updateVehicle(vehicle.id, {
          daysNotWorked: [...currentDaysOff, selectedDates.from.toISOString()]
        });
      }
    }

    toast.toast({
      title: "Días no laborables registrados",
      description: `Se han registrado los días del ${format(selectedDates.from, "dd/MM/yyyy")} al ${format(selectedDates.to, "dd/MM/yyyy")} como no laborables por ${newNonWorkingDay.reason} ${applyToAllVehicles ? "para todos los vehículos" : ""}`,
    });

    onOpenChange(false);
    setSelectedDates(undefined);
    setNewNonWorkingDay({
      date: new Date(),
      type: "holiday",
      reason: "",
      description: "",
    });
    setApplyToAllVehicles(false);
  };

  const typeLabels = {
    holiday: "Feriado",
    maintenance: "Mantenimiento",
    civic_strike: "Paro Cívico",
    retention: "Retención",
    other: "Otro",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Días No Laborables</DialogTitle>
          <DialogDescription>
            {selectedDates?.from && selectedDates?.to ? (
              `Periodo seleccionado: del ${format(selectedDates.from, "dd/MM/yyyy")} al ${format(selectedDates.to, "dd/MM/yyyy")}`
            ) : (
              "Selecciona el tipo y motivo de los días no laborables"
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="applyToAll"
              checked={applyToAllVehicles}
              onChange={(e) => {
                setApplyToAllVehicles(e.target.checked);
                if (e.target.checked) {
                  setSelectedVehicle("");
                }
              }}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="applyToAll">Aplicar a todos los vehículos</Label>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={newNonWorkingDay.type}
              onValueChange={(value: NonWorkingDay["type"]) =>
                setNewNonWorkingDay({ ...newNonWorkingDay, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="holiday">Feriado Nacional</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="civic_strike">Paro Cívico</SelectItem>
                <SelectItem value="retention">Retención</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Motivo</Label>
            <Input
              value={newNonWorkingDay.reason}
              onChange={(e) =>
                setNewNonWorkingDay({
                  ...newNonWorkingDay,
                  reason: e.target.value,
                })
              }
              placeholder="Ej: Feriado de Carnaval"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input
              value={newNonWorkingDay.description}
              onChange={(e) =>
                setNewNonWorkingDay({
                  ...newNonWorkingDay,
                  description: e.target.value,
                })
              }
              placeholder="Descripción detallada..."
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button onClick={handleAddNonWorkingDays}>
              Registrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NonWorkingDayDialog;
