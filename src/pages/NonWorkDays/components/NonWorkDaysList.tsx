
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vehicle } from "@/types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarX, Car, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NonWorkDaysListProps {
  vehicles: Vehicle[];
  onRemoveDay: (vehicleId: string, date: string) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const NonWorkDaysList = ({ 
  vehicles, 
  onRemoveDay,
  onSelectVehicle
}: NonWorkDaysListProps) => {
  // Ordenar vehículos: primero los que tienen días no trabajados
  const sortedVehicles = [...vehicles].sort((a, b) => {
    const aDays = a.daysNotWorked?.length || 0;
    const bDays = b.daysNotWorked?.length || 0;
    
    // Ordenar por número de días no trabajados (descendente)
    if (aDays !== bDays) return bDays - aDays;
    
    // Si tienen el mismo número de días, ordenar por placa
    return a.plate.localeCompare(b.plate);
  });

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "dd MMM yyyy", { locale: es });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedVehicles.length > 0 ? (
        sortedVehicles.map((vehicle) => {
          const daysNotWorked = vehicle.daysNotWorked || [];
          const hasDaysNotWorked = daysNotWorked.length > 0;
          
          return (
            <Card 
              key={vehicle.id} 
              className={`${
                hasDaysNotWorked 
                  ? "border-l-4 border-l-amber-500" 
                  : "border-l-4 border-l-green-500 opacity-70"
              } dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:shadow-md transition-shadow`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-md flex items-center gap-1">
                      <Car className="h-4 w-4 inline" />
                      {vehicle.plate}
                      {hasDaysNotWorked && (
                        <Badge variant="outline" className="ml-2 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                          {daysNotWorked.length} {daysNotWorked.length === 1 ? "día" : "días"}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      {vehicle.brand} {vehicle.model} - {vehicle.year}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => onSelectVehicle(vehicle)}
                  >
                    <CalendarX className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {hasDaysNotWorked ? (
                  <ScrollArea className="h-[140px] pr-4">
                    <ul className="space-y-2">
                      {[...daysNotWorked]
                        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                        .map((date) => (
                          <li key={date} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <span className="text-sm">{formatDate(date)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveDay(vehicle.id, date)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[140px] text-center gap-2 text-muted-foreground">
                    <CalendarX className="h-10 w-10 text-muted-foreground/60" />
                    <p className="text-sm">No hay días no trabajados registrados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mb-4 text-muted-foreground/60" />
          <p className="text-center">No se encontraron vehículos que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};
