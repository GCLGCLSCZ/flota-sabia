
import { format } from "date-fns";
import { AlertCircle, Ban } from "lucide-react";
import { VehicleDetailsProps } from "../types";

const VehicleDetails = ({ selectedVehicleId, vehicles }: VehicleDetailsProps) => {
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  
  if (!selectedVehicle) return null;
  
  return (
    <>
      <div className="space-y-2">
        <h3 className="font-medium">Días No Laborables</h3>
        {selectedVehicle.daysNotWorked?.length ? (
          selectedVehicle.daysNotWorked.map((day, index) => (
            <div
              key={index}
              className="p-3 bg-muted rounded-lg space-y-1"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Ban className="h-4 w-4 text-destructive" />
                {format(new Date(day), "dd/MM/yyyy")}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No hay días no laborables registrados</p>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Próximos Mantenimientos</h3>
        {selectedVehicle.maintenanceHistory?.length ? (
          selectedVehicle.maintenanceHistory.map((maintenance, index) => (
            <div
              key={index}
              className="p-3 bg-muted rounded-lg space-y-1"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-warning" />
                {format(new Date(maintenance.date), "dd/MM/yyyy")}
              </div>
              <p className="text-sm text-muted-foreground">
                {maintenance.description}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No hay mantenimientos programados</p>
        )}
      </div>
    </>
  );
};

export default VehicleDetails;
