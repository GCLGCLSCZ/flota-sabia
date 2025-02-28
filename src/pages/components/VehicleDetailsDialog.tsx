
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
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

  if (!vehicle) return null;

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

  return (
    <Dialog open={Boolean(vehicle)} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Detalles del Vehículo: {vehicle.plate}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
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
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
