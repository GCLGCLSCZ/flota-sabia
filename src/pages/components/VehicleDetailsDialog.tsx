
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import { Vehicle, Maintenance } from "@/types";
import { X, CalendarOff, Calendar, Trash2, Edit, Save, Check } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

// Definir un tipo para los días no trabajados
interface NonWorkDay {
  date: string;
  reason?: string;
  isSelected?: boolean;
}

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onAddMaintenance: (vehicleId: string, maintenance: any) => void;
}

const VehicleDetailsDialog = ({ vehicle, onClose, onAddMaintenance }: VehicleDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState("info");
  const { toast } = useToast();
  const { updateVehicle } = useApp();
  
  // Estados para edición de la información del vehículo
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<Partial<Vehicle>>({});
  
  // Estados para los campos del formulario de mantenimiento
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [costMaterials, setCostMaterials] = useState("");
  const [costLabor, setCostLabor] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  
  // Estado para el nuevo día no trabajado
  const [newNonWorkDay, setNewNonWorkDay] = useState<NonWorkDay>({ 
    date: new Date().toISOString().split('T')[0],
    reason: ""
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Estado para los días no trabajados seleccionados para eliminación
  const [nonWorkDaysData, setNonWorkDaysData] = useState<NonWorkDay[]>([]);
  const [nonWorkDayToEdit, setNonWorkDayToEdit] = useState<{ index: number, value: NonWorkDay } | null>(null);
  
  // Inicializar los datos de días no trabajados cuando cambia el vehículo
  useEffect(() => {
    if (vehicle && vehicle.daysNotWorked && Array.isArray(vehicle.daysNotWorked)) {
      // Convertir las fechas a objetos NonWorkDay
      const formattedDays = vehicle.daysNotWorked.map(day => {
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
  }, [vehicle]);
  
  if (!vehicle) return null;
  
  // Función para guardar cambios de edición
  const handleSaveVehicleInfo = () => {
    if (Object.keys(editedVehicle).length > 0) {
      updateVehicle(vehicle.id, editedVehicle)
        .then(() => {
          toast({
            title: "Información actualizada",
            description: "La información del vehículo ha sido actualizada"
          });
          setIsEditingInfo(false);
          setEditedVehicle({});
        })
        .catch(err => {
          toast({
            title: "Error",
            description: "No se pudo actualizar la información",
            variant: "destructive"
          });
          console.error("Error al actualizar información:", err);
        });
    } else {
      setIsEditingInfo(false);
    }
  };
  
  const handleInputChange = (field: keyof Vehicle, value: any) => {
    setEditedVehicle(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAddMaintenance = () => {
    if (!maintenanceDate || !description) {
      toast({
        title: "Campos requeridos",
        description: "La fecha y descripción son obligatorios",
        variant: "destructive"
      });
      return;
    }
    
    const maintenanceData = {
      date: maintenanceDate,
      costMaterials: parseFloat(costMaterials) || 0,
      costLabor: parseFloat(costLabor) || 0,
      salePrice: parseFloat(salePrice) || 0,
      description
    };
    
    onAddMaintenance(vehicle.id, maintenanceData);
    
    // Limpiar formulario
    setCostMaterials("");
    setCostLabor("");
    setSalePrice("");
    setDescription("");
    
    toast({
      title: "Mantenimiento registrado",
      description: "Se ha agregado un nuevo registro de mantenimiento"
    });
  };
  
  // Actualizar el estado de un día no trabajado con la razón
  const handleNewNonWorkDayChange = (key: keyof NonWorkDay, value: any) => {
    setNewNonWorkDay(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleAddNonWorkDay = () => {
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
    
    // Agregar el nuevo día no trabajado
    const updatedDaysNotWorked = [...daysNotWorked, { 
      date: newNonWorkDay.date, 
      reason: newNonWorkDay.reason || "",
      isSelected: false
    }];
    
    setNonWorkDaysData(updatedDaysNotWorked);
    
    // Actualizar el vehículo - solo enviar las fechas
    updateVehicle(vehicle.id, {
      daysNotWorked: updatedDaysNotWorked.map(day => day.date)
    }).then(() => {
      toast({
        title: "Día registrado",
        description: "Se ha agregado un nuevo día no trabajado"
      });
      // Resetear el campo de fecha y razón
      setNewNonWorkDay({ 
        date: new Date().toISOString().split('T')[0],
        reason: ""
      });
    }).catch(err => {
      toast({
        title: "Error",
        description: "No se pudo agregar el día no trabajado",
        variant: "destructive"
      });
      console.error("Error al agregar día no trabajado:", err);
    });
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
  
  const handleSaveEditedNonWorkDay = () => {
    if (!nonWorkDayToEdit) return;
    
    const { index, value } = nonWorkDayToEdit;
    const updatedDays = [...nonWorkDaysData];
    updatedDays[index] = value;
    
    setNonWorkDaysData(updatedDays);
    setNonWorkDayToEdit(null);
    
    // Actualizar en base de datos - solo enviar las fechas
    updateVehicle(vehicle.id, {
      daysNotWorked: updatedDays.map(day => day.date)
    }).then(() => {
      toast({
        title: "Día actualizado",
        description: "Se ha actualizado la información del día no trabajado"
      });
    }).catch(err => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la información",
        variant: "destructive"
      });
      console.error("Error al actualizar día no trabajado:", err);
    });
  };
  
  const handleRemoveSelectedNonWorkDays = () => {
    const selectedDays = nonWorkDaysData.filter(day => day.isSelected);
    if (selectedDays.length === 0) {
      toast({
        title: "Selección vacía",
        description: "Debe seleccionar al menos un día para eliminar",
        variant: "destructive"
      });
      return;
    }
    
    const updatedDays = nonWorkDaysData.filter(day => !day.isSelected);
    setNonWorkDaysData(updatedDays);
    
    // Actualizar en base de datos - solo enviar las fechas
    updateVehicle(vehicle.id, {
      daysNotWorked: updatedDays.map(day => day.date)
    }).then(() => {
      toast({
        title: "Días eliminados",
        description: `Se han eliminado ${selectedDays.length} día(s) no trabajado(s)`
      });
    }).catch(err => {
      toast({
        title: "Error",
        description: "No se pudieron eliminar los días seleccionados",
        variant: "destructive"
      });
      console.error("Error al eliminar días no trabajados:", err);
    });
  };
  
  const handleRemoveNonWorkDay = (dateToRemove: string) => {
    const updatedDaysNotWorked = nonWorkDaysData.filter(day => day.date !== dateToRemove);
    
    setNonWorkDaysData(updatedDaysNotWorked);
    
    // Actualizar en base de datos - solo enviar las fechas
    updateVehicle(vehicle.id, {
      daysNotWorked: updatedDaysNotWorked.map(day => day.date)
    }).then(() => {
      toast({
        title: "Día eliminado",
        description: "Se ha eliminado el día no trabajado"
      });
    }).catch(err => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el día no trabajado",
        variant: "destructive"
      });
      console.error("Error al eliminar día no trabajado:", err);
    });
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
    <Dialog open={!!vehicle} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex justify-between items-center">
            <span>{vehicle.plate} - {vehicle.model} {vehicle.year}</span>
            {activeTab === "info" && (
              <>
                {isEditingInfo ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleSaveVehicleInfo}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Guardar
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsEditingInfo(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                )}
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            <TabsTrigger value="financial">Financiero</TabsTrigger>
            <TabsTrigger value="nonworkdays">Días No Trabajados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Datos del Vehículo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm text-muted-foreground">Placa</Label>
                        {isEditingInfo ? (
                          <Input
                            value={editedVehicle.plate !== undefined ? editedVehicle.plate : vehicle.plate}
                            onChange={(e) => handleInputChange('plate', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p>{vehicle.plate}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Año</Label>
                        {isEditingInfo ? (
                          <Input
                            value={editedVehicle.year !== undefined ? editedVehicle.year : vehicle.year}
                            onChange={(e) => handleInputChange('year', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p>{vehicle.year}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Marca/Modelo</Label>
                      {isEditingInfo ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={editedVehicle.brand !== undefined ? editedVehicle.brand : vehicle.brand}
                            onChange={(e) => handleInputChange('brand', e.target.value)}
                            placeholder="Marca"
                            className="mt-1"
                          />
                          <Input
                            value={editedVehicle.model !== undefined ? editedVehicle.model : vehicle.model}
                            onChange={(e) => handleInputChange('model', e.target.value)}
                            placeholder="Modelo"
                            className="mt-1"
                          />
                        </div>
                      ) : (
                        <p>{vehicle.brand} {vehicle.model}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Estado</Label>
                      {isEditingInfo ? (
                        <select 
                          value={editedVehicle.status !== undefined ? editedVehicle.status : vehicle.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="w-full mt-1 p-2 rounded-md border border-input bg-[#F1F1F1] dark:bg-zinc-800"
                        >
                          <option value="active">Activo</option>
                          <option value="maintenance">En Mantenimiento</option>
                          <option value="inactive">Inactivo</option>
                        </select>
                      ) : (
                        <p className="capitalize">{vehicle.status}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Conductor Asignado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">Nombre</Label>
                      {isEditingInfo ? (
                        <Input
                          value={editedVehicle.driverName !== undefined ? editedVehicle.driverName : vehicle.driverName}
                          onChange={(e) => handleInputChange('driverName', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p>{vehicle.driverName}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Teléfono</Label>
                      {isEditingInfo ? (
                        <Input
                          value={editedVehicle.driverPhone !== undefined ? editedVehicle.driverPhone : vehicle.driverPhone}
                          onChange={(e) => handleInputChange('driverPhone', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p>{vehicle.driverPhone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Inversionista</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">Nombre</Label>
                    {isEditingInfo ? (
                      <Input
                        value={editedVehicle.investor !== undefined ? editedVehicle.investor : vehicle.investor}
                        onChange={(e) => handleInputChange('investor', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p>{vehicle.investor}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Tarifa diaria</Label>
                    {isEditingInfo ? (
                      <Input
                        type="number"
                        value={editedVehicle.installmentAmount !== undefined ? editedVehicle.installmentAmount : vehicle.installmentAmount}
                        onChange={(e) => handleInputChange('installmentAmount', parseFloat(e.target.value))}
                        className="mt-1"
                      />
                    ) : (
                      <p>Bs {vehicle.installmentAmount}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="maintenance" className="mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Registrar Nuevo Mantenimiento</CardTitle>
                  <CardDescription>
                    Ingresa los detalles del mantenimiento realizado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input 
                          id="date" 
                          type="date" 
                          value={maintenanceDate}
                          onChange={(e) => setMaintenanceDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost-materials">Costo de materiales (Bs)</Label>
                        <Input 
                          id="cost-materials" 
                          type="number" 
                          placeholder="0.00" 
                          min="0" 
                          step="0.01"
                          value={costMaterials}
                          onChange={(e) => setCostMaterials(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost-labor">Costo de mano de obra (Bs)</Label>
                        <Input 
                          id="cost-labor" 
                          type="number" 
                          placeholder="0.00" 
                          min="0" 
                          step="0.01"
                          value={costLabor}
                          onChange={(e) => setCostLabor(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sale-price">Precio de venta (Bs)</Label>
                        <Input 
                          id="sale-price" 
                          type="number" 
                          placeholder="0.00" 
                          min="0" 
                          step="0.01"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Detalla el mantenimiento realizado" 
                        className="min-h-[100px]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="button"
                    onClick={handleAddMaintenance}
                  >
                    Guardar Mantenimiento
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historial de Mantenimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 ? (
                    <div className="space-y-3">
                      {vehicle.maintenanceHistory
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((item, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="font-medium">{new Date(item.date).toLocaleDateString()}</div>
                              <div className="bg-primary/10 px-2 py-0.5 rounded text-xs text-primary">
                                {item.status || 'completado'}
                              </div>
                            </div>
                            <p className="mt-2 text-sm">{item.description}</p>
                            <div className="mt-2 text-sm flex flex-wrap gap-2">
                              <span className="bg-muted px-2 py-0.5 rounded">
                                Materiales: Bs {item.costMaterials || 0}
                              </span>
                              <span className="bg-muted px-2 py-0.5 rounded">
                                Mano de obra: Bs {item.costLabor || 0}
                              </span>
                              <span className="bg-muted px-2 py-0.5 rounded">
                                Total: Bs {(item.costMaterials || 0) + (item.costLabor || 0)}
                              </span>
                              {item.salePrice > 0 && (
                                <span className="bg-muted px-2 py-0.5 rounded">
                                  Venta: Bs {item.salePrice}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay registros de mantenimiento
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="financial" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Información Financiera</span>
                  {isEditingInfo ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleSaveVehicleInfo}
                      className="flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" />
                      Guardar
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsEditingInfo(true)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Fecha de inicio de contrato</Label>
                    {isEditingInfo ? (
                      <Input
                        type="date"
                        value={editedVehicle.contractStartDate !== undefined ? editedVehicle.contractStartDate : (vehicle.contractStartDate || '')}
                        onChange={(e) => handleInputChange('contractStartDate', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p>{vehicle.contractStartDate || 'No especificada'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Valor de cuota diaria</Label>
                    {isEditingInfo ? (
                      <Input
                        type="number"
                        value={editedVehicle.installmentAmount !== undefined ? editedVehicle.installmentAmount : (vehicle.installmentAmount || 0)}
                        onChange={(e) => handleInputChange('installmentAmount', parseFloat(e.target.value))}
                        className="mt-1"
                      />
                    ) : (
                      <p>Bs {vehicle.installmentAmount || 0}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Total de cuotas</Label>
                    {isEditingInfo ? (
                      <Input
                        type="number"
                        value={editedVehicle.totalInstallments !== undefined ? editedVehicle.totalInstallments : (vehicle.totalInstallments || 0)}
                        onChange={(e) => handleInputChange('totalInstallments', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    ) : (
                      <p>{vehicle.totalInstallments || 0}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Cuotas pagadas</Label>
                    {isEditingInfo ? (
                      <Input
                        type="number"
                        value={editedVehicle.paidInstallments !== undefined ? editedVehicle.paidInstallments : (vehicle.paidInstallments || 0)}
                        onChange={(e) => handleInputChange('paidInstallments', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    ) : (
                      <p>{vehicle.paidInstallments || 0}</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm text-muted-foreground">Total pagado hasta la fecha</Label>
                  {isEditingInfo ? (
                    <Input
                      type="number"
                      value={editedVehicle.totalPaid !== undefined ? editedVehicle.totalPaid : (vehicle.totalPaid || 0)}
                      onChange={(e) => handleInputChange('totalPaid', parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-bold">Bs {vehicle.totalPaid || 0}</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Ingresos mensuales estimados</Label>
                  {isEditingInfo ? (
                    <Input
                      type="number"
                      value={editedVehicle.monthlyEarnings !== undefined ? editedVehicle.monthlyEarnings : (vehicle.monthlyEarnings || 0)}
                      onChange={(e) => handleInputChange('monthlyEarnings', parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg">Bs {vehicle.monthlyEarnings || 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="nonworkdays" className="mt-4">
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
                          />
                          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
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
                        />
                      </div>
                    </div>
                    <Button 
                      type="button"
                      onClick={handleAddNonWorkDay}
                      className="w-full md:w-auto md:self-end"
                    >
                      Agregar Día
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
                                    />
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={handleSaveEditedNonWorkDay}
                                      className="h-10 w-10 p-0"
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
                                    >
                                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleRemoveNonWorkDay(day.date)}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
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
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
