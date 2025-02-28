
import { useState } from "react";
import { X, Calendar as CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import { Vehicle, Maintenance, MaintenanceType } from "@/types";

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onAddMaintenance?: (vehicleId: string, maintenance: Omit<Maintenance, "id" | "status">) => void;
}

const VehicleDetailsDialog = ({
  vehicle,
  onClose,
  onAddMaintenance,
}: VehicleDetailsDialogProps) => {
  const { toast } = useToast();
  const { updateVehicle, addFreeDay, removeFreeDay, refreshData } = useApp();
  const [maintenanceForm, setMaintenanceForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    costMaterials: 0,
    costLabor: 0,
    salePrice: 0,
    type: "mechanical" as MaintenanceType,
    proformaNumber: "",
    isInsuranceCovered: false,
  });
  
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [newFreeDay, setNewFreeDay] = useState<Date | undefined>(undefined);
  const [addingFreeDay, setAddingFreeDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!vehicle) return null;

  // Verificar si freeDays es un array válido
  const safeFreeDays = Array.isArray(vehicle.freeDays) ? vehicle.freeDays : [];
  
  // Convertir los días libres a objetos Date, asegurando que cada día sea válido
  const freeDayDates = safeFreeDays
    .filter(day => day && typeof day === 'string')
    .map(day => {
      try {
        return parseISO(day);
      } catch (e) {
        console.error("Error parseando fecha:", day, e);
        return null;
      }
    })
    .filter(Boolean) as Date[];

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    if (!maintenanceForm.description) {
      toast({
        title: "Error",
        description: "La descripción es obligatoria",
        variant: "destructive",
      });
      return;
    }

    if (maintenanceForm.costMaterials < 0 || maintenanceForm.costLabor < 0) {
      toast({
        title: "Error",
        description: "Los costos no pueden ser negativos",
        variant: "destructive",
      });
      return;
    }

    // Calcular costo total
    const cost = maintenanceForm.costMaterials + maintenanceForm.costLabor;

    // Crear objeto de mantenimiento incluyendo vehicleId y cost
    const maintenanceData: Omit<Maintenance, "id" | "status"> = {
      ...maintenanceForm,
      vehicleId: vehicle.id,
      cost
    };

    onAddMaintenance && onAddMaintenance(vehicle.id, maintenanceData);

    // Reset form
    setMaintenanceForm({
      date: new Date().toISOString().split("T")[0],
      description: "",
      costMaterials: 0,
      costLabor: 0,
      salePrice: 0,
      type: "mechanical",
      proformaNumber: "",
      isInsuranceCovered: false,
    });
  };

  const handleAddFreeDay = async () => {
    if (!newFreeDay || !vehicle || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Formatear la fecha al formato ISO (YYYY-MM-DD)
      const formattedDate = newFreeDay.toISOString().split('T')[0];
      
      // Usar la función específica para añadir días libres
      const success = await addFreeDay(vehicle.id, formattedDate);
      
      if (success) {
        // Actualizar UI y mostrar mensaje de éxito
        toast({
          title: "Jornada libre agregada",
          description: `Se ha registrado el ${format(newFreeDay, "d 'de' MMMM 'de' yyyy", { locale: es })} como jornada libre.`,
        });
        
        // Refrescar los datos para actualizar la UI
        await refreshData();
        
        // Restablecer el estado
        setNewFreeDay(undefined);
        setAddingFreeDay(false);
      } else {
        toast({
          title: "Error",
          description: "Esta fecha ya está registrada o hubo un problema al registrarla",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al agregar jornada libre:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la jornada libre",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFreeDay = async (dateToRemove: Date) => {
    if (!vehicle || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Formatear la fecha a eliminar
      const formattedDateToRemove = dateToRemove.toISOString().split('T')[0];
      
      // Usar la función específica para eliminar días libres
      const success = await removeFreeDay(vehicle.id, formattedDateToRemove);
      
      if (success) {
        // Mostrar mensaje de éxito
        toast({
          title: "Jornada libre eliminada",
          description: `Se ha eliminado el ${format(dateToRemove, "d 'de' MMMM 'de' yyyy", { locale: es })} de las jornadas libres.`,
        });
        
        // Refrescar los datos para actualizar la UI
        await refreshData();
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar la jornada libre",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al eliminar jornada libre:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la jornada libre",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(vehicle)} onOpenChange={() => onClose()} modal>
      <DialogContent className="max-w-[95vw] h-[90vh] overflow-y-auto flex flex-col p-0">
        <DialogHeader className="bg-background sticky top-0 z-10 p-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">
              Detalles del Vehículo: {vehicle.plate}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-auto p-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
              <TabsTrigger value="freedays">Jornada Libre</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Información del Vehículo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Placa</Label>
                        <p className="font-medium">{vehicle.plate}</p>
                      </div>
                      <div>
                        <Label>Modelo</Label>
                        <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Año</Label>
                        <p className="font-medium">{vehicle.year}</p>
                      </div>
                      <div>
                        <Label>Estado</Label>
                        <p className={`font-medium ${
                          vehicle.status === "active" ? "text-success" : 
                          vehicle.status === "maintenance" ? "text-warning" : 
                          "text-destructive"
                        }`}>
                          {vehicle.status === "active" ? "Activo" : 
                           vehicle.status === "maintenance" ? "En mantenimiento" : 
                           "Inactivo"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>Inversionista</Label>
                      <p className="font-medium">{vehicle.investor}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Conductor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <Label>Nombre</Label>
                      <p className="font-medium">{vehicle.driverName || "No asignado"}</p>
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <p className="font-medium">{vehicle.driverPhone || "No registrado"}</p>
                    </div>
                    <div>
                      <Label>Fecha de contrato</Label>
                      <p className="font-medium">
                        {vehicle.contractStartDate 
                          ? format(new Date(vehicle.contractStartDate), "dd/MM/yyyy") 
                          : "No registrada"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Información Financiera</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Comisión diaria</Label>
                      <p className="font-medium">{vehicle.dailyRate} Bs</p>
                    </div>
                    <div>
                      <Label>Cuota diaria</Label>
                      <p className="font-medium">{vehicle.installmentAmount || 0} Bs</p>
                    </div>
                    <div>
                      <Label>Total cuotas</Label>
                      <p className="font-medium">{vehicle.totalInstallments || 0}</p>
                    </div>
                    <div>
                      <Label>Cuotas pagadas</Label>
                      <p className="font-medium">{vehicle.paidInstallments?.toFixed(2) || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Historial de Mantenimiento</CardTitle>
                  <CardDescription>
                    Registros de mantenimiento del vehículo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 ? (
                    <div className="space-y-4">
                      {vehicle.maintenanceHistory.map((maintenance) => (
                        <div
                          key={maintenance.id}
                          className="border p-3 rounded-md space-y-2"
                        >
                          <div className="flex justify-between">
                            <div className="font-medium">
                              {format(new Date(maintenance.date), "dd/MM/yyyy")}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              maintenance.status === "completed" ? "bg-success/20 text-success" : 
                              maintenance.status === "pending" ? "bg-warning/20 text-warning" : 
                              "bg-destructive/20 text-destructive"
                            }`}>
                              {maintenance.status === "completed" ? "Completado" : 
                               maintenance.status === "pending" ? "Pendiente" : 
                               "Cancelado"}
                            </div>
                          </div>
                          <p className="text-sm">{maintenance.description}</p>
                          <div className="grid grid-cols-2 text-sm gap-2">
                            <div>
                              <Label>Costo Materiales</Label>
                              <p>{maintenance.costMaterials} Bs</p>
                            </div>
                            <div>
                              <Label>Costo Mano de Obra</Label>
                              <p>{maintenance.costLabor} Bs</p>
                            </div>
                            <div>
                              <Label>Costo Total</Label>
                              <p className="font-medium">{maintenance.cost} Bs</p>
                            </div>
                            <div>
                              <Label>Precio de Venta</Label>
                              <p>{maintenance.salePrice} Bs</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay registros de mantenimiento para este vehículo.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Registrar Mantenimiento</CardTitle>
                  <CardDescription>
                    Añade un nuevo registro de mantenimiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                          id="date"
                          type="date"
                          value={maintenanceForm.date}
                          onChange={(e) =>
                            setMaintenanceForm({
                              ...maintenanceForm,
                              date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <select
                          id="type"
                          className="w-full px-3 py-2 border border-input rounded-md"
                          value={maintenanceForm.type}
                          onChange={(e) =>
                            setMaintenanceForm({
                              ...maintenanceForm,
                              type: e.target.value as MaintenanceType,
                            })
                          }
                        >
                          <option value="mechanical">Mecánico</option>
                          <option value="body_paint">Carrocería/Pintura</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        placeholder="Detalle del mantenimiento realizado"
                        value={maintenanceForm.description}
                        onChange={(e) =>
                          setMaintenanceForm({
                            ...maintenanceForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="costMaterials">Costo Materiales (Bs)</Label>
                        <Input
                          id="costMaterials"
                          type="number"
                          min="0"
                          value={maintenanceForm.costMaterials}
                          onChange={(e) =>
                            setMaintenanceForm({
                              ...maintenanceForm,
                              costMaterials: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="costLabor">Costo Mano de Obra (Bs)</Label>
                        <Input
                          id="costLabor"
                          type="number"
                          min="0"
                          value={maintenanceForm.costLabor}
                          onChange={(e) =>
                            setMaintenanceForm({
                              ...maintenanceForm,
                              costLabor: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salePrice">Precio de Venta (Bs)</Label>
                        <Input
                          id="salePrice"
                          type="number"
                          min="0"
                          value={maintenanceForm.salePrice}
                          onChange={(e) =>
                            setMaintenanceForm({
                              ...maintenanceForm,
                              salePrice: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">Guardar Mantenimiento</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="freedays" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Jornadas Libres</CardTitle>
                  <CardDescription>
                    Registra los días en los que el vehículo no trabajará y no se contabilizarán para el cálculo de cuotas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lista de jornadas libres */}
                  {freeDayDates.length > 0 ? (
                    <div className="space-y-2">
                      <Label>Jornadas libres registradas ({freeDayDates.length})</Label>
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {freeDayDates.map((day, index) => (
                            <div 
                              key={index} 
                              className="flex justify-between items-center border p-2 rounded bg-muted/30"
                            >
                              <span>{format(day, "dd/MM/yyyy")}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveFreeDay(day)}
                                className="h-8 w-8 text-destructive"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay jornadas libres registradas.
                    </div>
                  )}

                  {/* Formulario para agregar nuevas jornadas libres */}
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Agregar Jornada Libre</h3>
                    
                    {addingFreeDay ? (
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                          <Label htmlFor="freeDate">Selecciona la fecha</Label>
                          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newFreeDay && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newFreeDay ? (
                                  format(newFreeDay, "PPP", { locale: es })
                                ) : (
                                  <span>Seleccionar fecha</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newFreeDay}
                                onSelect={(date) => {
                                  setNewFreeDay(date);
                                  setCalendarOpen(false);
                                }}
                                disabled={(date) => {
                                  // Deshabilitar fechas futuras lejanas (más de 1 mes)
                                  const oneMonthFromNow = new Date();
                                  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
                                  return date > oneMonthFromNow;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setAddingFreeDay(false);
                              setNewFreeDay(undefined);
                            }}
                            disabled={isSubmitting}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleAddFreeDay}
                            disabled={!newFreeDay || isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Guardando...
                              </>
                            ) : (
                              "Guardar"
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setAddingFreeDay(true)}
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Añadir Jornada Libre
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="sticky bottom-0 w-full bg-background p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
