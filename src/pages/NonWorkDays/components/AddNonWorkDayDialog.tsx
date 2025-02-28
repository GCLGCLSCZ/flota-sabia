
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle } from "@/types";
import { CalendarX } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AddNonWorkDayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onAddNonWorkDay: (vehicleId: string, date: string) => void;
  selectedVehicle: Vehicle | null;
}

const AddNonWorkDayDialog = ({
  isOpen,
  onClose,
  vehicles,
  onAddNonWorkDay,
  selectedVehicle
}: AddNonWorkDayDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [vehicleId, setVehicleId] = useState<string>(selectedVehicle?.id || "");

  // Establecer el vehículo seleccionado cuando cambia
  useState(() => {
    if (selectedVehicle) {
      setVehicleId(selectedVehicle.id);
    }
  });

  const handleSubmit = () => {
    if (vehicleId && date) {
      // Formatear la fecha para mantener consistencia con el resto de la aplicación
      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");
      onAddNonWorkDay(vehicleId, formattedDate);
    }
  };

  const activeVehicles = vehicles.filter(v => v.status === "active");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:text-white dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Registrar Día No Trabajado
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Selecciona un vehículo y la fecha en que no operó.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vehículo</label>
            <Select 
              value={vehicleId} 
              onValueChange={setVehicleId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {activeVehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.brand} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha</label>
            <div className="flex justify-center border rounded-md p-1 dark:border-gray-700">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={es}
                className="dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="dark:border-gray-700 dark:hover:bg-gray-700">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!vehicleId || !date}
          >
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNonWorkDayDialog;
