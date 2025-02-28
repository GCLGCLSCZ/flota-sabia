
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarOff, Calendar as CalendarIcon, Trash2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NonWorkDaysPageProps {
  vehicles: Vehicle[];
}

const NonWorkDaysPage = ({ vehicles }: NonWorkDaysPageProps) => {
  const { toast } = useToast();
  const { updateVehicle, refreshData } = useApp();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(new Date());
  const [reason, setReason] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  
  // Efecto para actualizar el vehículo seleccionado cuando cambia la selección
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      setSelectedVehicle(vehicle || null);
    } else {
      setSelectedVehicle(null);
    }
  }, [selectedVehicleId, vehicles]);

  const handleVehicleSelect = (value: string) => {
    setSelectedVehicleId(value);
  };

  const handleAddNonWorkDay = async () => {
    if (!selectedVehicle || !newDate) {
      toast({
        title: "Información incompleta",
        description: "Seleccione un vehículo y una fecha",
        variant: "destructive"
      });
      return;
    }

    const formattedDate = newDate.toISOString().split('T')[0];
    
    // Verificar si la fecha ya existe
    const currentDaysNotWorked = selectedVehicle.daysNotWorked || [];
    if (currentDaysNotWorked.includes(formattedDate)) {
      toast({
        title: "Fecha duplicada",
        description: "Esta fecha ya está registrada como día no trabajado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Agregar la nueva fecha a la lista
      const updatedDaysNotWorked = [...currentDaysNotWorked, formattedDate];
      
      // Actualizar el vehículo
      const success = await updateVehicle(selectedVehicle.id, {
        daysNotWorked: updatedDaysNotWorked
      });
      
      if (success) {
        toast({
          title: "Día registrado",
          description: "Se ha agregado un nuevo día no trabajado"
        });
        
        // Limpiar los campos
        setReason("");
        
        // Refrescar datos
        await refreshData();
      } else {
        toast({
          title: "Error",
          description: "No se pudo registrar el día no trabajado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error al registrar día no trabajado:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la solicitud",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteDate = async () => {
    if (!selectedVehicle || !deletingDate) return;
    
    setLoading(true);
    
    try {
      // Filtrar la fecha a eliminar
      const currentDaysNotWorked = selectedVehicle.daysNotWorked || [];
      const updatedDaysNotWorked = currentDaysNotWorked.filter(date => date !== deletingDate);
      
      // Actualizar el vehículo
      const success = await updateVehicle(selectedVehicle.id, {
        daysNotWorked: updatedDaysNotWorked
      });
      
      if (success) {
        toast({
          title: "Día eliminado",
          description: "Se ha eliminado el día no trabajado"
        });
        
        // Refrescar datos
        await refreshData();
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el día no trabajado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error al eliminar día no trabajado:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la solicitud",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setDeletingDate(null);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setNewDate(date);
    setCalendarOpen(false);
  };

  // Calcular la reducción de pagos por días no trabajados
  const calculatePaymentDeduction = () => {
    if (!selectedVehicle) return 0;
    
    const daysNotWorked = selectedVehicle.daysNotWorked?.length || 0;
    const dailyRate = selectedVehicle.dailyRate || 0;
    
    return daysNotWorked * dailyRate;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Días No Trabajados</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => refreshData()}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Seleccionar Vehículo</CardTitle>
          <CardDescription>
            Elija un vehículo para gestionar sus días no trabajados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedVehicleId} onValueChange={handleVehicleSelect}>
            <SelectTrigger className="w-full md:w-[350px]">
              <SelectValue placeholder="Seleccione un vehículo" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {selectedVehicle && (
        <>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Información del Vehículo</CardTitle>
              <CardDescription>
                Detalles del vehículo seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Placa</h3>
                  <p className="text-lg">{selectedVehicle.plate}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Conductor</h3>
                  <p className="text-lg">{selectedVehicle.driverName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Tarifa Diaria</h3>
                  <p className="text-lg">Bs {selectedVehicle.dailyRate || 0}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Días No Trabajados</h3>
                  <p className="text-lg">{selectedVehicle.daysNotWorked?.length || 0} días</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Reducción de Pagos</h3>
                  <p className="text-lg text-destructive">Bs {calculatePaymentDeduction()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Registrar Día No Trabajado</CardTitle>
                <CardDescription>
                  Agregue una nueva fecha en la que el vehículo no generó ingresos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <div className="flex gap-2">
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={loading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newDate ? format(newDate, "PPP", { locale: es }) : "Seleccione una fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newDate}
                          onSelect={handleCalendarSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ej: Feriado, Mantenimiento, etc."
                    disabled={loading}
                  />
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={handleAddNonWorkDay}
                  disabled={loading}
                >
                  {loading ? "Agregando..." : "Registrar Día No Trabajado"}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Días No Trabajados</CardTitle>
                <CardDescription>
                  Listado de días en los que el vehículo no generó ingresos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedVehicle.daysNotWorked && selectedVehicle.daysNotWorked.length > 0 ? (
                  <div className="space-y-2">
                    {[...selectedVehicle.daysNotWorked]
                      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                      .map((date, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <CalendarOff className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(date), "PPP", { locale: es })}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => setDeletingDate(date)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No hay días no trabajados registrados
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!deletingDate} onOpenChange={(open) => !open && setDeletingDate(null)}>
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
              onClick={confirmDeleteDate}
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

export default NonWorkDaysPage;
