
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Ban, Calendar, Wrench, X, ChevronDown, ChevronUp } from "lucide-react";
import { VehicleDetailsProps } from "../types";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const VehicleDetails = ({ selectedVehicleId, vehicles }: VehicleDetailsProps) => {
  const { updateVehicle } = useApp();
  const { toast } = useToast();
  const [showAllDays, setShowAllDays] = useState(false);
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
  
  // Decidir cuántos días mostrar
  const daysToShow = showAllDays ? sortedDaysNotWorked : sortedDaysNotWorked.slice(0, 5);

  // Función para eliminar un día no laborable
  const handleRemoveNonWorkingDay = async (dayToRemove: string) => {
    if (!selectedVehicle || !selectedVehicle.daysNotWorked) return;
    
    // Filtramos el día a eliminar
    const updatedDaysNotWorked = selectedVehicle.daysNotWorked.filter(
      day => day !== dayToRemove
    );
    
    // Actualizamos el vehículo
    const success = await updateVehicle(selectedVehicle.id, {
      daysNotWorked: updatedDaysNotWorked
    });
    
    if (success) {
      toast({
        title: "Día eliminado",
        description: "Se ha eliminado el día no laborable correctamente. Este día ahora cuenta como día laborable y afectará el cálculo de deuda.",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el día no laborable.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <div className="space-y-2">
        <h3 className="font-medium flex items-center gap-1">
          <Ban className="h-4 w-4 text-destructive" />
          Días No Laborables ({sortedDaysNotWorked.length})
        </h3>
        
        {daysToShow.length ? (
          <div className="space-y-2">
            {daysToShow.map((day, index) => (
              <div
                key={index}
                className="p-3 bg-muted rounded-lg space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(day), "EEEE d 'de' MMMM yyyy", { locale: es })}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRemoveNonWorkingDay(day)}
                    title="Eliminar día no laborable"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {sortedDaysNotWorked.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs flex items-center justify-center gap-1 mt-1"
                onClick={() => setShowAllDays(!showAllDays)}
              >
                {showAllDays ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Ver todos los {sortedDaysNotWorked.length} días
                  </>
                )}
              </Button>
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
        
        {sortedMaintenance.length ? (
          <div className="space-y-2">
            {sortedMaintenance.slice(0, 5).map((maintenance, index) => (
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
