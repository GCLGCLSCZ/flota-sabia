
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { es } from "date-fns/locale";
import { MaintenanceDialogProps } from "../types";

const MaintenanceDialog = ({ open, onOpenChange, vehicles }: MaintenanceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programar Mantenimiento</DialogTitle>
          <DialogDescription>
            Selecciona un vehículo y la fecha para programar el mantenimiento
          </DialogDescription>
        </DialogHeader>
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
            <Button onClick={() => onOpenChange(false)}>
              Programar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceDialog;
