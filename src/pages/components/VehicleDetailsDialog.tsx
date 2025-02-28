
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
import { useApp } from "@/context/AppContext";
import VehicleDetails from "../Calendar/components/VehicleDetails";
import NonWorkingDaysTab from "./NonWorkingDaysTab";

const VehicleDetailsDialog = ({ vehicle, onClose, onAddMaintenance }) => {
  const [activeTab, setActiveTab] = useState("info");
  const { toast } = useToast();
  const { vehicles } = useApp();
  
  if (!vehicle) return null;
  
  const handleAddMaintenance = (maintenanceData) => {
    onAddMaintenance(vehicle.id, maintenanceData);
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
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            <TabsTrigger value="financial">Financiero</TabsTrigger>
            <TabsTrigger value="non-working-days">Días No Laborables</TabsTrigger>
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
                  <form id="maintenanceForm" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost-materials">Costo de materiales (Bs)</Label>
                        <Input id="cost-materials" type="number" placeholder="0.00" min="0" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost-labor">Costo de mano de obra (Bs)</Label>
                        <Input id="cost-labor" type="number" placeholder="0.00" min="0" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sale-price">Precio de venta (Bs)</Label>
                        <Input id="sale-price" type="number" placeholder="0.00" min="0" step="0.01" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Detalla el mantenimiento realizado" 
                        className="min-h-[100px]"
                      />
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      const form = document.getElementById('maintenanceForm');
                      const date = form.querySelector('#date').value;
                      const costMaterials = parseFloat(form.querySelector('#cost-materials').value) || 0;
                      const costLabor = parseFloat(form.querySelector('#cost-labor').value) || 0;
                      const salePrice = parseFloat(form.querySelector('#sale-price').value) || 0;
                      const description = form.querySelector('#description').value;
                      
                      if (!date || !description) {
                        toast({
                          title: "Campos requeridos",
                          description: "La fecha y descripción son obligatorios",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      handleAddMaintenance({
                        date,
                        costMaterials,
                        costLabor,
                        salePrice,
                        description
                      });
                      
                      // Limpiar formulario
                      form.querySelector('#cost-materials').value = '';
                      form.querySelector('#cost-labor').value = '';
                      form.querySelector('#sale-price').value = '';
                      form.querySelector('#description').value = '';
                      
                      toast({
                        title: "Mantenimiento registrado",
                        description: "Se ha agregado un nuevo registro de mantenimiento"
                      });
                    }}
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
                  <VehicleDetails
                    selectedVehicleId={vehicle.id}
                    vehicles={vehicles}
                  />
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
          
          <TabsContent value="non-working-days" className="mt-4">
            <NonWorkingDaysTab vehicle={vehicle} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
