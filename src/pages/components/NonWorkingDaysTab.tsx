
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Trash2, Plus, Ban } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type NonWorkingDay = {
  date: string;
  type: "holiday" | "workshop" | "recovered" | "other";
  details: string;
};

interface NonWorkingDaysTabProps {
  vehicle: any;
}

const NonWorkingDaysTab = ({ vehicle }: NonWorkingDaysTabProps) => {
  const { updateVehicle } = useApp();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [nonWorkingDays, setNonWorkingDays] = useState<NonWorkingDay[]>([]);
  const [dayType, setDayType] = useState<"holiday" | "workshop" | "recovered" | "other">("workshop");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Cargar días no laborables existentes
  useEffect(() => {
    if (vehicle && vehicle.daysNotWorked) {
      // Convertir la estructura simple a la nueva estructura con tipos
      const convertedDays = vehicle.daysNotWorked.map(dateStr => {
        // Buscamos si hay información de tipo en el string de la fecha (formato antiguo)
        let type: "holiday" | "workshop" | "recovered" | "other" = "other";
        let details = "";
        
        // Si el vehículo ya tiene el nuevo formato de días no laborables
        if (vehicle.nonWorkingDaysDetails && vehicle.nonWorkingDaysDetails[dateStr]) {
          type = vehicle.nonWorkingDaysDetails[dateStr].type || "other";
          details = vehicle.nonWorkingDaysDetails[dateStr].details || "";
        }
        
        return {
          date: dateStr,
          type,
          details
        };
      });
      
      setNonWorkingDays(convertedDays);
    }
  }, [vehicle]);

  // Agregar nuevos días no laborables
  const handleAddNonWorkingDays = async () => {
    if (!selectedDates.length) {
      toast({
        title: "Selecciona fechas",
        description: "Debes seleccionar al menos una fecha para continuar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Crear nuevos días no laborables
      const newNonWorkingDays = selectedDates.map(date => ({
        date: format(date, "yyyy-MM-dd"),
        type: dayType,
        details: details
      }));
      
      // Combinar con los días existentes, evitando duplicados
      const updatedDays = [...nonWorkingDays];
      
      newNonWorkingDays.forEach(newDay => {
        const existingIndex = updatedDays.findIndex(day => day.date === newDay.date);
        if (existingIndex >= 0) {
          // Actualizar día existente
          updatedDays[existingIndex] = newDay;
        } else {
          // Agregar nuevo día
          updatedDays.push(newDay);
        }
      });
      
      setNonWorkingDays(updatedDays);
      
      // Actualizar el vehículo con los nuevos días no laborables
      // Mantenemos compatibilidad con el formato anterior
      const daysNotWorked = updatedDays.map(day => day.date);
      
      // Creamos un objeto para almacenar los detalles de los días
      const detailsObject = {};
      updatedDays.forEach(day => {
        detailsObject[day.date] = {
          type: day.type,
          details: day.details
        };
      });
      
      await updateVehicle(vehicle.id, {
        daysNotWorked,
        nonWorkingDaysDetails: detailsObject
      });
      
      toast({
        title: "Días no laborables agregados",
        description: `Se han agregado ${selectedDates.length} días no laborables al vehículo ${vehicle.plate}`,
      });
      
      // Limpiar formulario
      setSelectedDates([]);
      setDayType("workshop");
      setDetails("");
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error al agregar días no laborables:", error);
      toast({
        title: "Error",
        description: "No se pudieron agregar los días no laborables",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar un día no laborable
  const handleRemoveNonWorkingDay = async (dateToRemove: string) => {
    try {
      // Filtrar el día a eliminar
      const updatedDays = nonWorkingDays.filter(day => day.date !== dateToRemove);
      setNonWorkingDays(updatedDays);
      
      // Actualizar el vehículo
      const daysNotWorked = updatedDays.map(day => day.date);
      
      // Actualizamos los detalles de los días
      const detailsObject = {};
      updatedDays.forEach(day => {
        detailsObject[day.date] = {
          type: day.type,
          details: day.details
        };
      });
      
      await updateVehicle(vehicle.id, {
        daysNotWorked,
        nonWorkingDaysDetails: detailsObject
      });
      
      toast({
        title: "Día eliminado",
        description: "El día se ha eliminado de la lista de días no laborables",
      });
    } catch (error) {
      console.error("Error al eliminar día no laborable:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el día no laborable",
        variant: "destructive",
      });
    }
  };

  // Obtener etiqueta para el tipo de día
  const getDayTypeLabel = (type: string) => {
    switch (type) {
      case "holiday": return "Feriado Nacional";
      case "workshop": return "Taller";
      case "recovered": return "Recuperado";
      case "other": return "Otros";
      default: return "Desconocido";
    }
  };

  // Obtener color para el tipo de día
  const getDayTypeColor = (type: string) => {
    switch (type) {
      case "holiday": return "bg-blue-100 text-blue-800";
      case "workshop": return "bg-yellow-100 text-yellow-800";
      case "recovered": return "bg-green-100 text-green-800";
      case "other": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Ordenar días por fecha (más recientes primero)
  const sortedDays = [...nonWorkingDays].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Formatear fecha para mostrar
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "EEEE d 'de' MMMM yyyy", { locale: es });
  };

  // Verificar si una fecha ya está seleccionada
  const isDateSelected = (date: Date) => {
    return selectedDates.some(
      selectedDate => format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  // Manejar selección de fechas múltiples
  const handleDateSelect = (date: Date) => {
    if (isDateSelected(date)) {
      // Si la fecha ya está seleccionada, la quitamos
      setSelectedDates(selectedDates.filter(
        selectedDate => format(selectedDate, "yyyy-MM-dd") !== format(date, "yyyy-MM-dd")
      ));
    } else {
      // Si la fecha no está seleccionada, la agregamos
      setSelectedDates([...selectedDates, date]);
    }
  };

  // Renderizar días seleccionados como píldoras
  const renderSelectedDates = () => {
    if (selectedDates.length === 0) {
      return <div className="text-muted-foreground text-sm">Ninguna fecha seleccionada</div>;
    }

    // Ordenar fechas seleccionadas
    const orderedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {orderedDates.map((date, index) => (
          <div key={index} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs flex items-center">
            {format(date, "d MMM yyyy", { locale: es })}
            <button 
              className="ml-1 hover:text-primary/80"
              onClick={(e) => {
                e.preventDefault();
                setSelectedDates(selectedDates.filter((_, i) => i !== index));
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Días No Laborables</h3>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Días
        </Button>
      </div>

      {/* Lista de días no laborables */}
      {sortedDays.length > 0 ? (
        <div className="space-y-3 mt-4">
          {sortedDays.map((day, index) => (
            <div 
              key={index} 
              className="p-3 bg-card rounded-lg border flex items-start justify-between"
            >
              <div>
                <div className="font-medium capitalize">
                  {formatDate(day.date)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getDayTypeColor(day.type)}`}>
                    {getDayTypeLabel(day.type)}
                  </span>
                  {day.details && (
                    <span className="text-sm text-muted-foreground">
                      {day.details}
                    </span>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleRemoveNonWorkingDay(day.date)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg flex flex-col items-center justify-center bg-card">
          <Ban className="h-12 w-12 text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">No hay días no laborables registrados</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowAddDialog(true)}
          >
            Agregar días no laborables
          </Button>
        </div>
      )}

      {/* Diálogo para agregar días no laborables */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Días No Laborables</DialogTitle>
            <DialogDescription>
              Selecciona las fechas en que el vehículo {vehicle.plate} no trabajará.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dates">Selecciona fechas</Label>
              <div className="flex flex-col space-y-2">
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          handleDateSelect(date);
                        }
                      }}
                      modifiers={{
                        selected: selectedDates
                      }}
                      modifiersClassNames={{
                        selected: "bg-primary/50 text-primary-foreground"
                      }}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                
                {renderSelectedDates()}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de día no laborable</Label>
              <Select 
                value={dayType} 
                onValueChange={(value: "holiday" | "workshop" | "recovered" | "other") => setDayType(value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holiday">Feriado Nacional</SelectItem>
                  <SelectItem value="workshop">Taller</SelectItem>
                  <SelectItem value="recovered">Recuperado</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Detalles (opcional)</Label>
              <Input
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Ingresa una descripción o motivo"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddNonWorkingDays} 
              disabled={isSubmitting || selectedDates.length === 0}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NonWorkingDaysTab;
