
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { X, CalendarOff, Calendar, Trash2, Edit, Check } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { daysNotWorkedService } from "@/services/daysNotWorkedService";

// Definir un tipo para los días no trabajados
interface NonWorkDay {
  date: string;
  reason?: string;
  isSelected?: boolean;
}

interface DaysNotWorkedTabProps {
  vehicleId: string;
  initialDays: string[];
  onUpdateDaysNotWorked: (vehicleId: string, daysNotWorked: string[]) => Promise<boolean>;
}

const DaysNotWorkedTab = ({ vehicleId, initialDays, onUpdateDaysNotWorked }: DaysNotWorkedTabProps) => {
  const { toast } = useToast();
  
  // Estado para el nuevo día no trabajado
  const [newNonWorkDay, setNewNonWorkDay] = useState<NonWorkDay>({ 
    date: new Date().toISOString().split('T')[0],
    reason: ""
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Estado para los días no trabajados
  const [nonWorkDaysData, setNonWorkDaysData] = useState<NonWorkDay[]>([]);
  const [nonWorkDayToEdit, setNonWorkDayToEdit] = useState<{ index: number, value: NonWorkDay } | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Inicializar los datos de días no trabajados cuando cambia el vehículo
  useEffect(() => {
    if (initialDays && Array.isArray(initialDays)) {
      // Convertir las fechas a objetos NonWorkDay
      const formattedDays = initialDays.map(day => {
        // Asegurarse de que 'day' sea tratado como una cadena
        const dateStr = String(day);
        return { 
          date: dateStr, 
          isSelected: false 
        };
      });
      setNonWorkDaysData(formattedDays);
    } else {
      setNonWorkDaysData([]);
    }
  }, [initialDays]);
  
  // Actualizar el estado de un día no trabajado con la razón
  const handleNewNonWorkDayChange = (key: keyof NonWorkDay, value: any) => {
    setNewNonWorkDay(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleAddNonWorkDay = async () => {
    if (!newNonWorkDay.date) {
      toast({
        title: "Fecha requerida",
        description: "Debe seleccionar una fecha",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar si la fecha ya existe
    const daysNotWorked = nonWorkDaysData || [];
    if (daysNotWorked.some(day => day.date === newNonWorkDay.date)) {
      toast({
        title: "Fecha duplicada",
        description: "Esta fecha ya está registrada como día no trabajado",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Agregar el nuevo día no trabajado
      const updatedDaysNotWorked = [...daysNotWorked, { 
        date: newNonWorkDay.date, 
        reason: newNonWorkDay.reason || "",
        isSelected: false
      }];
      
      setNonWorkDaysData(updatedDaysNotWorked);
      
      // Actualizar el vehículo - solo enviar las fechas
      const success = await onUpdateDaysNotWorked(vehicleId, updatedDaysNotWorked.map(day => day.date));
      
      if (success) {
        toast({
          title: "Día registrado",
          description: "Se ha agregado un nuevo día no trabajado"
        });
        // Resetear el campo de fecha y razón
        setNewNonWorkDay({ 
          date: new Date().toISOString().split('T')[0],
          reason: ""
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar el día no trabajado",
          variant: "destructive"
        });
        // Revertir cambios locales si hubo error
        setNonWorkDaysData(daysNotWorked);
      }
    } catch (err) {
      console.error("Error al agregar día no trabajado:", err);
      toast({
        title: "Error",
        description: "No se pudo agregar el día no trabajado",
        variant: "destructive"
      });
      // Revertir cambios locales si hubo error
      setNonWorkDaysData(daysNotWorked);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleSelectNonWorkDay = (index: number) => {
    setNonWorkDaysData(prev => 
      prev.map((day, i) => 
        i === index ? { ...day, isSelected: !day.isSelected } : day
      )
    );
  };
  
  const handleEditNonWorkDay = (index: number) => {
    setNonWorkDayToEdit({
      index,
      value: { ...nonWorkDaysData[index] }
    });
  };
  
  const handleSaveEditedNonWorkDay = async () => {
    if (!nonWorkDayToEdit) return;
    
    try {
      setLoading(true);
      
      const { index, value } = nonWorkDayToEdit;
      const originalDays = [...nonWorkDaysData];
      const updatedDays = [...nonWorkDaysData];
      updatedDays[index] = value;
      
      setNonWorkDaysData(updatedDays);
      setNonWorkDayToEdit(null);
      
      // Actualizar en base de datos - solo enviar las fechas
      const success = await onUpdateDaysNotWorked(vehicleId, updatedDays.map(day => day.date));
      
      if (success) {
        toast({
          title: "Día actualizado",
          description: "Se ha actualizado la información del día no trabajado"
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar la información",
          variant: "destructive"
        });
        // Revertir cambios locales si hubo error
        setNonWorkDaysData(originalDays);
      }
    } catch (err) {
      console.error("Error al actualizar día no trabajado:", err);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información",
        variant: "destructive"
      });
      // Revertir cambios si hubo error
      if (nonWorkDayToEdit) {
        const originalDays = [...nonWorkDaysData];
        setNonWorkDaysData(originalDays);
        setNonWorkDayToEdit(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveSelectedNonWorkDays = async () => {
    const selectedDays = nonWorkDaysData.filter(day => day.isSelected);
    if (selectedDays.length === 0) {
      toast({
        title: "Selección vacía",
        description: "Debe seleccionar al menos un día para eliminar",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const originalDays = [...nonWorkDaysData];
      const updatedDays = nonWorkDaysData.filter(day => !day.isSelected);
      
      setNonWorkDaysData(updatedDays);
      
      // Actualizar en base de datos - solo enviar las fechas
      const success = await onUpdateDaysNotWorked(vehicleId, updatedDays.map(day => day.date));
      
      if (success) {
        toast({
          title: "Días eliminados",
          description: `Se han eliminado ${selectedDays.length} día(s) no trabajado(s)`
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron eliminar los días seleccionados",
          variant: "destructive"
        });
        // Revertir cambios locales si hubo error
        setNonWorkDaysData(originalDays);
      }
    } catch (err) {
      console.error("Error al eliminar días no trabajados:", err);
      toast({
        title: "Error",
        description: "No se pudieron eliminar los días seleccionados",
        variant: "destructive"
      });
      // Revertir cambios locales si hubo error
      const originalDays = [...nonWorkDaysData];
      setNonWorkDaysData(originalDays);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      
      const dateToRemove = confirmDelete;
      const originalDays = [...nonWorkDaysData];
      const updatedDaysNotWorked = nonWorkDaysData.filter(day => day.date !== dateToRemove);
      
      // Primero actualizamos la interfaz
      setNonWorkDaysData(updatedDaysNotWorked);
      
      // Ahora intentamos eliminar usando el método específico
      const success = await daysNotWorkedService.removeDay(vehicleId, dateToRemove);
      
      if (success) {
        toast({
          title: "Día eliminado",
          description: "Se ha eliminado el día no trabajado"
        });
      } else {
        // Si falla, intentamos con el método general
        const backupSuccess = await onUpdateDaysNotWorked(vehicleId, updatedDaysNotWorked.map(day => day.date));
        
        if (backupSuccess) {
          toast({
            title: "Día eliminado",
            description: "Se ha eliminado el día no trabajado"
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudo eliminar el día no trabajado",
            variant: "destructive"
          });
          // Revertir cambios locales si hubo error
          setNonWorkDaysData(originalDays);
        }
      }
    } catch (err) {
      console.error("Error al eliminar día no trabajado:", err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el día no trabajado",
        variant: "destructive"
      });
      // Revertir cambios locales si hubo error
      const originalDays = [...nonWorkDaysData];
      setNonWorkDaysData(originalDays);
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };
  
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setNewNonWorkDay(prev => ({
        ...prev,
        date: formattedDate
      }));
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };
  
  // Contador de días seleccionados
  const selectedCount = nonWorkDaysData.filter(day => day.isSelected).length;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registrar Días No Trabajados</CardTitle>
          <CardDescription>
            Agrega fechas en las que el vehículo no generó ingresos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="non-work-day">Fecha</Label>
                <div className="flex gap-2">
                  <Input 
                    id="non-work-day" 
                    type="date" 
                    value={newNonWorkDay.date}
                    onChange={(e) => handleNewNonWorkDayChange('date', e.target.value)}
                    className="flex-1"
                    disabled={loading}
                  />
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" disabled={loading}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleCalendarSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="non-work-day-reason">Motivo</Label>
                <Input 
                  id="non-work-day-reason" 
                  type="text" 
                  placeholder="Ej: Feriado, Mantenimiento, etc." 
                  value={newNonWorkDay.reason || ""}
                  onChange={(e) => handleNewNonWorkDayChange('reason', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Button 
              type="button"
              onClick={handleAddNonWorkDay}
              className="w-full md:w-auto md:self-end"
              disabled={loading}
            >
              {loading ? "Agregando..." : "Agregar Día"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Días No Trabajados</CardTitle>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleRemoveSelectedNonWorkDays}
                  className="flex items-center"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar ({selectedCount})
                </Button>
              )}
              <div className="bg-muted px-2 py-1 rounded text-sm">
                Total: {nonWorkDaysData.length} día(s)
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {nonWorkDaysData.length > 0 ? (
            <div className="space-y-3">
              {nonWorkDaysData
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((day, index) => (
                  <div key={index} className={`p-3 border rounded-lg flex items-start ${day.isSelected ? 'bg-muted/50 border-primary' : ''}`}>
                    <div className="mr-2 mt-1">
                      <Checkbox 
                        checked={day.isSelected} 
                        onCheckedChange={() => handleToggleSelectNonWorkDay(index)} 
                        id={`day-${index}`} 
                        className="translate-y-1"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex-1">
                      {nonWorkDayToEdit && nonWorkDayToEdit.index === index ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input 
                              type="date" 
                              value={nonWorkDayToEdit.value.date}
                              onChange={(e) => setNonWorkDayToEdit({
                                index,
                                value: { ...nonWorkDayToEdit.value, date: e.target.value }
                              })}
                              className="w-full"
                              disabled={loading}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={handleSaveEditedNonWorkDay}
                              className="h-10 w-10 p-0"
                              disabled={loading}
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          </div>
                          <Input 
                            type="text" 
                            placeholder="Motivo" 
                            value={nonWorkDayToEdit.value.reason || ""}
                            onChange={(e) => setNonWorkDayToEdit({
                              index,
                              value: { ...nonWorkDayToEdit.value, reason: e.target.value }
                            })}
                            disabled={loading}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium flex items-center">
                              <CalendarOff className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{format(new Date(day.date), "dd/MM/yyyy")}</span>
                            </div>
                            {day.reason && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                Motivo: {day.reason}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditNonWorkDay(index)}
                              className="h-8 w-8 p-0"
                              disabled={loading}
                            >
                              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setConfirmDelete(day.date)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              disabled={loading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No hay días no trabajados registrados
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar día no trabajado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el día seleccionado de los registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DaysNotWorkedTab;
