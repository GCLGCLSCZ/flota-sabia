
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { NonWorkingDayDialogProps, NonWorkingDay } from "../types";
import { es } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

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
  
  const [showDaysHistory, setShowDaysHistory] = useState(false);
  
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
    setSelectedDates(undefined);
    setNewNonWorkingDay({
      date: new Date(),
      type: "holiday",
      reason: "",
      description: "",
    });
    setApplyToAllVehicles(false);
    setSelectedVehicle("");
    setShowDaysHistory(true);
  };

  const handleDeleteNonWorkingDays = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    updateVehicle(vehicleId, {
      daysNotWorked: []
    });
    
    toast.toast({
      title: "Días no laborables eliminados",
      description: `Se han eliminado todos los días no laborables para el vehículo ${vehicle.plate}`,
    });
  };

  const handleDeleteAllNonWorkingDays = () => {
    vehicles.forEach(vehicle => {
      if (vehicle.daysNotWorked && vehicle.daysNotWorked.length > 0) {
        updateVehicle(vehicle.id, {
          daysNotWorked: []
        });
      }
    });
    
    toast.toast({
      title: "Días no laborables eliminados",
      description: "Se han eliminado todos los días no laborables para todos los vehículos",
    });
  };

  const typeLabels = {
    holiday: "Feriado",
    maintenance: "Mantenimiento",
    civic_strike: "Paro Cívico",
    retention: "Retención",
    other: "Otro",
  };

  // Obtener vehículos con días no laborables
  const vehiclesWithNonWorkingDays = vehicles.filter(v => v.daysNotWorked && v.daysNotWorked.length > 0);
  const hasVehiclesWithNonWorkingDays = vehiclesWithNonWorkingDays.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

        {!showDaysHistory ? (
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
            <div className="flex justify-between gap-4 pt-4">
              <Button variant="outline" onClick={() => setShowDaysHistory(true)}>
                Ver días registrados
              </Button>
              <Button onClick={handleAddNonWorkingDays}>
                Registrar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Días no laborables registrados</h3>
              <Button variant="outline" onClick={() => setShowDaysHistory(false)}>
                Registrar nuevos días
              </Button>
            </div>

            {hasVehiclesWithNonWorkingDays ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Días no laborables</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehiclesWithNonWorkingDays.map(vehicle => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.plate}</TableCell>
                        <TableCell>{vehicle.daysNotWorked?.length || 0} días</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteNonWorkingDays(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAllNonWorkingDays}
                  >
                    Eliminar todos los días no laborables
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay días no laborables registrados
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NonWorkingDayDialog;
