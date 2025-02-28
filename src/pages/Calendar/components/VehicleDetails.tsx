
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Ban, Calendar, Wrench } from "lucide-react";
import { VehicleDetailsProps } from "../types";

const VehicleDetails = ({ selectedVehicleId, vehicles }: VehicleDetailsProps) => {
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  
  if (!selectedVehicle) return null;
  
  // Ordenar días no laborables por fecha (más recientes primero)
  const sortedDaysNotWorked = selectedVehicle.daysNotWorked 
    ? [...selectedVehicle.daysNotWorked].sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      )
    : [];
  
  // Ordenar mantenimientos por fecha (más recientes primero)
  const sortedMaintenance = selectedVehicle.maintenanceHistory 
    ? [...selectedVehicle.maintenanceHistory].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];
  
  // Limitar el número de elementos a mostrar
  const recentDaysNotWorked = sortedDaysNotWorked.slice(0, 5);
  const recentMaintenance = sortedMaintenance.slice(0, 5);
  
  return (
    <>
      <div className="space-y-2">
        <h3 className="font-medium flex items-center gap-1">
          <Ban className="h-4 w-4 text-destructive" />
          Días No Laborables ({sortedDaysNotWorked.length})
        </h3>
        
        {recentDaysNotWorked.length ? (
          <div className="space-y-2">
            {recentDaysNotWorked.map((day, index) => (
              <div
                key={index}
                className="p-3 bg-muted rounded-lg space-y-1"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(day), "EEEE d 'de' MMMM yyyy", { locale: es })}
                </div>
              </div>
            ))}
            
            {sortedDaysNotWorked.length > 5 && (
              <p className="text-xs text-muted-foreground text-right">
                + {sortedDaysNotWorked.length - 5} más...
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay días no laborables registrados</p>
        )}
      </div>

      <div className="space-y-2 mt-6">
        <h3 className="font-medium flex items-center gap-1">
          <Wrench className="h-4 w-4 text-warning" />
          Mantenimientos ({sortedMaintenance.length})
        </h3>
        
        {recentMaintenance.length ? (
          <div className="space-y-2">
            {recentMaintenance.map((maintenance, index) => (
              <div
                key={index}
                className="p-3 bg-muted rounded-lg space-y-1"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  {format(new Date(maintenance.date), "d MMM yyyy", { locale: es })}
                </div>
                <p className="text-sm text-muted-foreground">
                  {maintenance.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Costo: {maintenance.cost.toFixed(2)} Bs
                </p>
              </div>
            ))}
            
            {sortedMaintenance.length > 5 && (
              <p className="text-xs text-muted-foreground text-right">
                + {sortedMaintenance.length - 5} más...
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay mantenimientos registrados</p>
        )}
      </div>
    </>
  );
};

export default VehicleDetails;
