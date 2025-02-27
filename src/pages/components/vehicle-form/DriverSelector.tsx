
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Driver, Vehicle } from "@/types";

interface DriverSelectorProps {
  formData: Partial<Vehicle>;
  onChange: (formData: Partial<Vehicle>) => void;
  drivers: Driver[];
  onDriverSelect: (driverId: string) => void;
}

const DriverSelector = ({ formData, onChange, drivers, onDriverSelect }: DriverSelectorProps) => {
  return (
    <div className="space-y-2 col-span-2">
      <Label htmlFor="driver">Conductor (Opcional)</Label>
      <Select 
        value={formData.driverId || ""} 
        onValueChange={onDriverSelect}
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
  );
};

export default DriverSelector;
