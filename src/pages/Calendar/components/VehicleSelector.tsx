
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VehicleSelectorProps } from "../types";

const VehicleSelector = ({ selectedVehicle, setSelectedVehicle, vehicles, disabled }: VehicleSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Seleccionar Vehículo</Label>
      <Select
        value={selectedVehicle}
        onValueChange={setSelectedVehicle}
        disabled={disabled}
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
  );
};

export default VehicleSelector;
