
import { Vehicle } from "@/types";
import { format } from "date-fns";

interface VehicleDriverInfoProps {
  vehicle: Vehicle;
}

const VehicleDriverInfo = ({ vehicle }: VehicleDriverInfoProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-muted-foreground dark:text-gray-400">Conductor</p>
        <p className="font-medium truncate">
          {vehicle.driverName ? vehicle.driverName : "Sin asignar"}
        </p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground dark:text-gray-400">
          Fecha de contrato
        </p>
        <p className="font-medium">
          {vehicle.contractStartDate 
            ? format(new Date(vehicle.contractStartDate), "dd/MM/yyyy") 
            : "No registrada"}
        </p>
      </div>
    </div>
  );
};

export default VehicleDriverInfo;
