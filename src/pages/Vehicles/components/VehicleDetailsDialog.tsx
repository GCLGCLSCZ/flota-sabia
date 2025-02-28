
import { useState } from "react";
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
import { Vehicle, Maintenance, InsurancePolicy, InsurancePayment } from "@/types";

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onAddMaintenance: (vehicleId: string, maintenance: any) => void;
}

const VehicleDetailsDialog = ({ vehicle, onClose, onAddMaintenance }: VehicleDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState("info");
  const { toast } = useToast();
  
  // Estados para los campos del formulario de mantenimiento
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [costMaterials, setCostMaterials] = useState("");
  const [costLabor, setCostLabor] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  
  if (!vehicle) return null;
  
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
  
  return (
    <Dialog open={!!vehicle} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {vehicle.plate} - {vehicle.model} {vehicle.year}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            <TabsTrigger value="financial">Financiero</TabsTrigger>
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
                        <p>{vehicle.plate}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Año</Label>
                        <p>{vehicle.year}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Marca/Modelo</Label>
                      <p>{vehicle.brand} {vehicle.model}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Estado</Label>
                      <p className="capitalize">{vehicle.status}</p>
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
                      <p>{vehicle.driverName}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Teléfono</Label>
                      <p>{vehicle.driverPhone}</p>
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
                    <p>{vehicle.investor}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Tarifa diaria</Label>
                    <p>Bs {vehicle.installmentAmount}</p>
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
                <CardTitle className="text-lg">Información Financiera</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Fecha de inicio de contrato</Label>
                    <p>{vehicle.contractStartDate || 'No especificada'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Valor de cuota diaria</Label>
                    <p>Bs {vehicle.installmentAmount || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Total de cuotas</Label>
                    <p>{vehicle.totalInstallments || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Cuotas pagadas</Label>
                    <p>{vehicle.paidInstallments || 0}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm text-muted-foreground">Total pagado hasta la fecha</Label>
                  <p className="text-lg font-bold">Bs {vehicle.totalPaid || 0}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Ingresos mensuales estimados</Label>
                  <p className="text-lg">Bs {vehicle.monthlyEarnings || 0}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
