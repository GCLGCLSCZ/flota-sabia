
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle } from "@/types";
import { format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarX, Plus, Trash2 } from "lucide-react";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NonWorkDaysCalendarProps {
  vehicles: Vehicle[];
  onAddDay: (vehicleId: string, date: string) => void;
  onRemoveDay: (vehicleId: string, date: string) => void;
}

export const NonWorkDaysCalendar = ({ 
  vehicles, 
  onAddDay,
  onRemoveDay
}: NonWorkDaysCalendarProps) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    vehicles.length > 0 ? vehicles[0].id : null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Obtener el vehículo seleccionado
  const selectedVehicle = selectedVehicleId 
    ? vehicles.find(v => v.id === selectedVehicleId) 
    : null;

  // Obtener los días no trabajados del vehículo seleccionado
  const daysNotWorked = selectedVehicle?.daysNotWorked?.map(date => new Date(date)) || [];

  // Función para añadir un día no trabajado
  const handleAddDay = () => {
    if (selectedVehicleId && selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");
      onAddDay(selectedVehicleId, dateString);
    }
  };

  // Verifica si la fecha seleccionada ya está registrada
  const isDateRegistered = selectedDate && daysNotWorked.some(date => 
    isSameDay(date, selectedDate)
  );

  // Función para eliminar un día no trabajado seleccionado
  const handleRemoveSelectedDay = () => {
    if (selectedVehicleId && selectedDate) {
      // Encontrar la fecha exacta en el formato guardado
      const matchingDate = selectedVehicle?.daysNotWorked?.find(dateStr => 
        isSameDay(new Date(dateStr), selectedDate)
      );
      
      if (matchingDate) {
        onRemoveDay(selectedVehicleId, matchingDate);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 dark:bg-gray-800 dark:text-white dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Calendario de Días No Trabajados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Select
              value={selectedVehicleId || ""}
              onValueChange={setSelectedVehicleId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.brand} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={es}
                className="rounded-md border dark:border-gray-700 dark:bg-gray-800"
                modifiers={{
                  nonWorkDay: daysNotWorked,
                }}
                modifiersClassNames={{
                  nonWorkDay: "bg-amber-100 text-amber-900 font-bold dark:bg-amber-800/30 dark:text-amber-400",
                }}
              />
            </div>

            <div className="flex justify-center gap-2">
              <Button
                onClick={handleAddDay}
                disabled={!selectedVehicleId || !selectedDate || isDateRegistered}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Registrar Día
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleRemoveSelectedDay}
                disabled={!selectedVehicleId || !selectedDate || !isDateRegistered}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar Día
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-md">
            {selectedVehicle ? (
              <span>
                Días no trabajados: {selectedVehicle.plate}
                <Badge className="ml-2 bg-amber-500">{daysNotWorked.length}</Badge>
              </span>
            ) : (
              "Selecciona un vehículo"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedVehicle ? (
            <ScrollArea className="h-[300px]">
              {daysNotWorked.length > 0 ? (
                <ul className="space-y-2">
                  {[...daysNotWorked]
                    .sort((a, b) => b.getTime() - a.getTime())
                    .map((date, index) => (
                      <li key={index} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-sm">
                          {format(date, "EEEE, dd MMMM yyyy", { locale: es })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const matchingDate = selectedVehicle.daysNotWorked?.find(dateStr => 
                              isSameDay(new Date(dateStr), date)
                            );
                            if (matchingDate) {
                              onRemoveDay(selectedVehicle.id, matchingDate);
                            }
                          }}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center gap-2 text-muted-foreground">
                  <CalendarX className="h-10 w-10 text-muted-foreground/60" />
                  <p>Este vehículo no tiene días no trabajados registrados.</p>
                </div>
              )}
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-center text-muted-foreground">
              <p>Selecciona un vehículo para ver sus días no trabajados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
