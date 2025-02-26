
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
import { Car, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  daysOff: Date[];
  nextMaintenance?: Date;
}

interface MaintenanceEvent {
  id: string;
  vehicleId: string;
  date: Date;
  type: string;
  description: string;
}

const Calendar = () => {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>();
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);

  // Datos de ejemplo
  const vehicles: Vehicle[] = [
    {
      id: "1",
      plate: "ABC-123",
      model: "Toyota Corolla",
      daysOff: [new Date(2024, 2, 15), new Date(2024, 2, 16)],
      nextMaintenance: new Date(2024, 3, 1),
    },
    {
      id: "2",
      plate: "DEF-456",
      model: "Nissan Sentra",
      daysOff: [new Date(2024, 2, 20)],
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
      toast({
        title: "Días no trabajados marcados",
        description: `Se han marcado los días del ${format(range.from, "dd/MM/yyyy")} al ${format(range.to, "dd/MM/yyyy")}`,
      });
    }
  };

  const getHighlightedDays = () => {
    const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);
    return selectedVehicleData?.daysOff || [];
  };

  const getMaintenanceDays = () => {
    return maintenanceEvents
      .filter((event) => event.vehicleId === selectedVehicle)
      .map((event) => event.date);
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
        <Button onClick={() => setShowMaintenanceDialog(true)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Programar Mantenimiento
        </Button>
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
