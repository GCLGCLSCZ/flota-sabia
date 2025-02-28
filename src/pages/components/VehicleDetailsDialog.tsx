
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle, Maintenance } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onAddMaintenance: (vehicleId: string, maintenance: Omit<Maintenance, "id" | "status">) => void;
}

const VehicleDetailsDialog = ({ vehicle, onClose, onAddMaintenance }: VehicleDetailsDialogProps) => {
  const { toast } = useToast();
  const { addFreeDay, removeFreeDay } = useApp();
  const [maintenanceData, setMaintenanceData] = useState<Omit<Maintenance, "id" | "status">>({
    vehicleId: vehicle?.id || "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    cost: 0,
    costMaterials: 0,
    costLabor: 0,
    salePrice: 0,
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  if (!vehicle) return null;

  // Update vehicleId when vehicle changes
  if (maintenanceData.vehicleId !== vehicle.id) {
    setMaintenanceData(prev => ({
      ...prev,
      vehicleId: vehicle.id
    }));
  }

  // Función para verificar si una fecha está en la lista de días no trabajados
  const isDateNotWorked = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return vehicle.daysNotWorked?.includes(formattedDate) || 
           vehicle.freeDays?.includes(formattedDate) || 
           false;
  };

  // Manejar agregar/quitar un día no trabajado
  const handleToggleFreeDay = async (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    
    if (isDateNotWorked(date)) {
      // Si ya está marcado como no trabajado, lo quitamos
      const success = await removeFreeDay(vehicle.id, formattedDate);
      if (success) {
        toast({
          title: "Día actualizado",
          description: `El día ${formattedDate} ha sido marcado como trabajado.`,
        });
      }
    } else {
      // Si no está marcado, lo agregamos como no trabajado
      const success = await addFreeDay(vehicle.id, formattedDate);
      if (success) {
        toast({
          title: "Día actualizado",
          description: `El día ${formattedDate} ha sido marcado como no trabajado.`,
        });
      }
    }
  };

  const handleSubmitMaintenance = () => {
    if (vehicle?.id) {
      // We're passing the full maintenanceData object, which includes vehicleId
      onAddMaintenance(vehicle.id, maintenanceData);
      setMaintenanceData({
        vehicleId: vehicle.id,
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
        cost: 0,
        costMaterials: 0,
        costLabor: 0,
        salePrice: 0,
      });
    }
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Vehículo: {vehicle.plate}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            <TabsTrigger value="days">Días No Trabajados</TabsTrigger>
            <TabsTrigger value="cardex">Cardex</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Datos del Vehículo</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Placa:</p>
                  <p>{vehicle.plate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Marca:</p>
                  <p>{vehicle.brand}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Modelo:</p>
                  <p>{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Año:</p>
                  <p>{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Estado:</p>
                  <p>{vehicle.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Inversionista:</p>
                  <p>{vehicle.investor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Tarifa Diaria:</p>
                  <p>{vehicle.dailyRate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Conductor:</p>
                  <p>{vehicle.driverName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Teléfono del Conductor:</p>
                  <p>{vehicle.driverPhone}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Mantenimiento</CardTitle>
                <CardDescription>Historial de mantenimientos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 ? (
                  <div className="space-y-2">
                    {vehicle.maintenanceHistory.map((maintenance) => (
                      <div key={maintenance.id} className="border p-3 rounded-lg">
                        <div className="flex justify-between">
                          <p className="font-medium">{maintenance.description}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                            {maintenance.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Fecha: {maintenance.date}</p>
                        <p className="text-sm">Costo Total: Bs {maintenance.cost}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          <p>Materiales: Bs {maintenance.costMaterials}</p>
                          <p>Mano de obra: Bs {maintenance.costLabor}</p>
                          <p>Precio de venta: Bs {maintenance.salePrice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay registros de mantenimiento</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nuevo Mantenimiento</CardTitle>
                <CardDescription>Registrar un nuevo mantenimiento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-date">Fecha</Label>
                    <Input
                      id="maintenance-date"
                      type="date"
                      value={maintenanceData.date}
                      onChange={(e) =>
                        setMaintenanceData({ ...maintenanceData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-type">Tipo</Label>
                    <select
                      id="maintenance-type"
                      className="w-full p-2 border rounded-md"
                      value={maintenanceData.type || "mechanical"}
                      onChange={(e) =>
                        setMaintenanceData({
                          ...maintenanceData,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="mechanical">Mecánico</option>
                      <option value="body_paint">Carrocería/Pintura</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance-description">Descripción</Label>
                  <Input
                    id="maintenance-description"
                    value={maintenanceData.description}
                    onChange={(e) =>
                      setMaintenanceData({
                        ...maintenanceData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-cost-materials">Costo Materiales</Label>
                    <Input
                      id="maintenance-cost-materials"
                      type="number"
                      value={maintenanceData.costMaterials}
                      onChange={(e) =>
                        setMaintenanceData({
                          ...maintenanceData,
                          costMaterials: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-cost-labor">Costo Mano de Obra</Label>
                    <Input
                      id="maintenance-cost-labor"
                      type="number"
                      value={maintenanceData.costLabor}
                      onChange={(e) =>
                        setMaintenanceData({
                          ...maintenanceData,
                          costLabor: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-sale-price">Precio de Venta</Label>
                    <Input
                      id="maintenance-sale-price"
                      type="number"
                      value={maintenanceData.salePrice}
                      onChange={(e) =>
                        setMaintenanceData({
                          ...maintenanceData,
                          salePrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <Button className="w-full" onClick={handleSubmitMaintenance}>
                  Guardar Mantenimiento
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="days" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Días No Trabajados</CardTitle>
                <CardDescription>
                  Selecciona las fechas en las que el vehículo no trabajó
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          if (date) {
                            handleToggleFreeDay(date);
                          }
                        }}
                        modifiers={{
                          notWorked: (date) => isDateNotWorked(date)
                        }}
                        modifiersClassNames={{
                          notWorked: "bg-red-100 text-red-900"
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="w-full">
                    <h3 className="font-medium mb-2">Días marcados como no trabajados:</h3>
                    {(vehicle.daysNotWorked || vehicle.freeDays || []).length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {(vehicle.daysNotWorked || vehicle.freeDays || []).map((date) => (
                          <div
                            key={date}
                            className="flex items-center justify-between bg-red-100 text-red-900 p-2 rounded-md"
                          >
                            <span>{date}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const dateObj = new Date(date);
                                handleToggleFreeDay(dateObj);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay días marcados como no trabajados</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cardex" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cardex del Vehículo</CardTitle>
                <CardDescription>Registro de servicios y repuestos</CardDescription>
              </CardHeader>
              <CardContent>
                {vehicle.cardex && vehicle.cardex.length > 0 ? (
                  <div className="space-y-2">
                    {vehicle.cardex.map((item) => (
                      <div key={item.id} className="border p-3 rounded-lg">
                        <div className="flex justify-between">
                          <p className="font-medium">{item.description}</p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              item.complete
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.complete ? "Completado" : "Pendiente"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Tipo: {item.type}</p>
                        <p className="text-sm text-muted-foreground">Fecha: {item.date}</p>
                        {item.nextScheduledDate && (
                          <p className="text-sm text-muted-foreground">
                            Próximo servicio: {item.nextScheduledDate}
                          </p>
                        )}
                        <p className="text-sm">Costo: Bs {item.cost}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay registros de cardex</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
