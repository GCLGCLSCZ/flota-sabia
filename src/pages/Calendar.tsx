import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Car, Calendar as CalendarIcon, AlertCircle, Ban } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  daysOff: NonWorkingDay[];
  nextMaintenance?: Date;
}

interface MaintenanceEvent {
  id: string;
  vehicleId: string;
  date: Date;
  type: string;
  description: string;
}

interface NonWorkingDay {
  date: Date;
  reason: string;
  description: string;
  type: "holiday" | "maintenance" | "civic_strike" | "retention" | "other";
}

const Calendar = () => {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>();
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showNonWorkingDayDialog, setShowNonWorkingDayDialog] = useState(false);
  const [newNonWorkingDay, setNewNonWorkingDay] = useState({
    type: "holiday",
    reason: "",
    description: "",
  });

  // Datos de ejemplo
  const vehicles: Vehicle[] = [
    {
      id: "1",
      plate: "ABC-123",
      model: "Toyota Corolla",
      daysOff: [
        {
          date: new Date(2024, 2, 15),
          reason: "Feriado Nacional",
          description: "Carnaval",
          type: "holiday",
        },
        {
          date: new Date(2024, 2, 16),
          reason: "Mantenimiento",
          description: "Cambio de aceite",
          type: "maintenance",
        },
      ],
      nextMaintenance: new Date(2024, 3, 1),
    },
    {
      id: "2",
      plate: "DEF-456",
      model: "Nissan Sentra",
      daysOff: [
        {
          date: new Date(2024, 2, 20),
          reason: "Paro Cívico",
          description: "Paro departamental",
          type: "civic_strike",
        },
      ],
      nextMaintenance: new Date(2024, 3, 15),
    },
  ];

  const maintenanceEvents: MaintenanceEvent[] = [
    {
      id: "m1",
      vehicleId: "1",
      date: new Date(2024, 3, 1),
      type: "Preventivo",
      description: "Cambio de aceite y filtros",
    },
    {
      id: "m2",
      vehicleId: "2",
      date: new Date(2024, 3, 15),
      type: "Preventivo",
      description: "Revisión general",
    },
  ];

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!selectedVehicle) {
      toast({
        title: "Selecciona un vehículo",
        description: "Debes seleccionar un vehículo antes de marcar días.",
        variant: "destructive",
      });
      return;
    }
    setSelectedDates(range);
    if (range?.from && range?.to) {
      setShowNonWorkingDayDialog(true);
    }
  };

  const handleAddNonWorkingDays = () => {
    if (!selectedDates?.from || !selectedDates?.to || !selectedVehicle) return;

    toast({
      title: "Días no laborables registrados",
      description: `Se han registrado los días del ${format(selectedDates.from, "dd/MM/yyyy")} al ${format(selectedDates.to, "dd/MM/yyyy")} como no laborables por ${newNonWorkingDay.reason}`,
    });

    setShowNonWorkingDayDialog(false);
    setSelectedDates(undefined);
    setNewNonWorkingDay({
      type: "holiday",
      reason: "",
      description: "",
    });
  };

  const getHighlightedDays = () => {
    const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);
    return selectedVehicleData?.daysOff.map(d => d.date) || [];
  };

  const getMaintenanceDays = () => {
    return maintenanceEvents
      .filter((event) => event.vehicleId === selectedVehicle)
      .map((event) => event.date);
  };

  const getNonWorkingDayInfo = (date: Date) => {
    const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);
    return selectedVehicleData?.daysOff.find(
      (d) => d.date.toDateString() === date.toDateString()
    );
  };

  const typeLabels = {
    holiday: "Feriado",
    maintenance: "Mantenimiento",
    civic_strike: "Paro Cívico",
    retention: "Retención",
    other: "Otro",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Calendario de Vehículos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los días no trabajados y mantenimientos programados
          </p>
        </div>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => setShowNonWorkingDayDialog(true)}>
            <Ban className="mr-2 h-4 w-4" />
            Marcar Día No Laborable
          </Button>
          <Button onClick={() => setShowMaintenanceDialog(true)}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Programar Mantenimiento
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Seleccionar Vehículo</Label>
            <Select
              value={selectedVehicle}
              onValueChange={setSelectedVehicle}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>{vehicle.plate} - {vehicle.model}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedVehicle && (
            <>
              <div className="space-y-2">
                <h3 className="font-medium">Días No Laborables</h3>
                {vehicles
                  .find((v) => v.id === selectedVehicle)
                  ?.daysOff.map((day, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-lg space-y-1"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Ban className="h-4 w-4 text-destructive" />
                        {format(day.date, "dd/MM/yyyy")}
                      </div>
                      <p className="text-sm font-medium">{day.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.description}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Próximos Mantenimientos</h3>
                {maintenanceEvents
                  .filter((event) => event.vehicleId === selectedVehicle)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-muted rounded-lg space-y-1"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        {format(event.date, "dd/MM/yyyy")}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.type}: {event.description}
                      </p>
                    </div>
                  ))}
              </div>
            </>
          )}
        </Card>

        <Card className="p-4">
          <CalendarComponent
            mode="range"
            selected={selectedDates}
            onSelect={handleDateSelect}
            modifiers={{
              daysOff: getHighlightedDays(),
              maintenance: getMaintenanceDays(),
            }}
            modifiersStyles={{
              daysOff: { backgroundColor: "#FEE2E2" },
              maintenance: { backgroundColor: "#DBEAFE" },
            }}
            locale={es}
            className="w-full"
          />
        </Card>
      </div>

      {/* Diálogo de Días No Laborables */}
      <Dialog open={showNonWorkingDayDialog} onOpenChange={setShowNonWorkingDayDialog}>
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

      <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programar Mantenimiento</DialogTitle>
            <DialogDescription>
              Selecciona un vehículo y la fecha para programar el mantenimiento
            </DialogDescription>
          </DialogHeader>
          {/* Aquí iría el formulario para programar mantenimiento */}
          <div className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CalendarComponent
              mode="single"
              locale={es}
            />
            <div className="flex justify-end gap-4">
              <Button onClick={() => setShowMaintenanceDialog(false)}>
                Programar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
