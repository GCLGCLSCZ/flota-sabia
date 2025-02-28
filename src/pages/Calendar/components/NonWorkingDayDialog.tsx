
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { NonWorkingDayDialogProps, NonWorkingDay } from "../types";
import { es } from "date-fns/locale";

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
    if (!selectedDates?.from || !selectedDates?.to || (!selectedVehicle && !applyToAllVehicles)) {
      toast.toast({
        title: "Error",
        description: "Debes seleccionar un rango de fechas y un vehículo, o marcar la opción de aplicar a todos los vehículos",
        variant: "destructive"
      });
      return;
    }

    // Función para generar un rango de días
    const getDatesInRange = (start: Date, end: Date) => {
      const dates = [];
      const currentDate = new Date(start);
      
      // Establecer hora a inicio del día para comparaciones correctas
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      // Incluir el día final en el rango
      while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    };

    // Obtener todas las fechas en el rango seleccionado
    const dateRange = getDatesInRange(selectedDates.from, selectedDates.to);
    
    if (applyToAllVehicles) {
      // Aplicar a todos los vehículos activos
      vehicles.forEach((vehicle) => {
        if (vehicle.status === "active") {
          const currentDaysOff = vehicle.daysNotWorked || [];
          const updatedDaysOff = [...currentDaysOff];
          
          // Agregar cada fecha del rango si no existe ya
          dateRange.forEach(date => {
            const dateStr = date.toISOString();
            if (!currentDaysOff.includes(dateStr)) {
              updatedDaysOff.push(dateStr);
            }
          });
          
          updateVehicle(vehicle.id, {
            daysNotWorked: updatedDaysOff
          });
        }
      });
      
      toast.toast({
        title: "Días no laborables registrados",
        description: `Se han registrado los días del ${format(selectedDates.from, "dd/MM/yyyy", { locale: es })} al ${format(selectedDates.to, "dd/MM/yyyy", { locale: es })} como no laborables por ${newNonWorkingDay.reason} para todos los vehículos activos`,
      });
    } else if (selectedVehicle) {
      // Aplicar solo al vehículo seleccionado
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      if (vehicle) {
        const currentDaysOff = vehicle.daysNotWorked || [];
        const updatedDaysOff = [...currentDaysOff];
        
        // Agregar cada fecha del rango si no existe ya
        dateRange.forEach(date => {
          const dateStr = date.toISOString();
          if (!currentDaysOff.includes(dateStr)) {
            updatedDaysOff.push(dateStr);
          }
        });
        
        updateVehicle(vehicle.id, {
          daysNotWorked: updatedDaysOff
        });
        
        toast.toast({
          title: "Días no laborables registrados",
          description: `Se han registrado los días del ${format(selectedDates.from, "dd/MM/yyyy", { locale: es })} al ${format(selectedDates.to, "dd/MM/yyyy", { locale: es })} como no laborables por ${newNonWorkingDay.reason} para el vehículo ${vehicle.plate}`,
        });
      }
    }

    // Limpiar el formulario
    onOpenChange(false);
    setSelectedDates(undefined);
    setNewNonWorkingDay({
      date: new Date(),
      type: "holiday",
      reason: "",
      description: "",
    });
    setApplyToAllVehicles(false);
    setSelectedVehicle("");
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
              `Periodo seleccionado: del ${format(selectedDates.from, "dd/MM/yyyy", { locale: es })} al ${format(selectedDates.to, "dd/MM/yyyy", { locale: es })}`
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
            <Label htmlFor="applyToAll">Aplicar a todos los vehículos activos</Label>
          </div>

          {!applyToAllVehicles && (
            <div className="space-y-2">
              <Label>Vehículo</Label>
              <Select
                value={selectedVehicle}
                onValueChange={setSelectedVehicle}
                disabled={applyToAllVehicles}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles
                    .filter(v => v.status === "active")
                    .map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.model}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          )}

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
