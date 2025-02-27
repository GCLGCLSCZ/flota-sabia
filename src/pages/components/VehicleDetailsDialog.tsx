
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle, Maintenance } from "@/types";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useApp } from "@/context/AppContext";

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onAddMaintenance: (vehicleId: string, maintenance: Omit<Maintenance, "id" | "status">) => void;
}

const VehicleDetailsDialog = ({ vehicle, onClose, onAddMaintenance }: VehicleDetailsDialogProps) => {
  const [tab, setTab] = useState("details");
  const { payments } = useApp();
  const [maintenance, setMaintenance] = useState<Omit<Maintenance, "id" | "status">>({
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    costMaterials: 0,
    salePrice: 0,
  });

  if (!vehicle) return null;

  // Filtramos pagos correspondientes a este vehículo
  const vehiclePayments = payments.filter(p => p.vehicleId === vehicle.id && p.status === "completed");
  const totalPaid = vehiclePayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculamos cuotas pagadas en base al total pagado y el monto por cuota
  const calculatedPaidInstallments = vehicle.installmentAmount ? 
    Math.floor(totalPaid / vehicle.installmentAmount) : 
    vehicle.paidInstallments || 0;
  
  // Cuotas restantes
  const remainingInstallments = (vehicle.totalInstallments || 0) - calculatedPaidInstallments;

  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMaintenance(vehicle.id, maintenance);
    // Reset form
    setMaintenance({
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      costMaterials: 0,
      salePrice: 0,
    });
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalles del Vehículo: {vehicle.plate}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Información General</TabsTrigger>
            <TabsTrigger value="contract">Contrato</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold">Información del Vehículo</h3>
                <div className="text-sm mt-2 space-y-1">
                  <p><span className="font-medium">Placa:</span> {vehicle.plate}</p>
                  <p><span className="font-medium">Marca:</span> {vehicle.brand}</p>
                  <p><span className="font-medium">Modelo:</span> {vehicle.model}</p>
                  <p><span className="font-medium">Año:</span> {vehicle.year}</p>
                  <p><span className="font-medium">Estado:</span> {
                    vehicle.status === "active" ? "Activo" : 
                    vehicle.status === "maintenance" ? "En Mantenimiento" : "Inactivo"
                  }</p>
                  <p><span className="font-medium">Tarifa diaria:</span> Bs {vehicle.dailyRate}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold">Información de Operación</h3>
                <div className="text-sm mt-2 space-y-1">
                  <p><span className="font-medium">Inversionista:</span> {vehicle.investor || "No asignado"}</p>
                  <p><span className="font-medium">Conductor:</span> {vehicle.driverName || "No asignado"}</p>
                  {vehicle.driverPhone && (
                    <p><span className="font-medium">Teléfono del conductor:</span> {vehicle.driverPhone}</p>
                  )}
                  <p><span className="font-medium">Último mantenimiento:</span> {
                    vehicle.lastMaintenance ? 
                    format(new Date(vehicle.lastMaintenance), "dd MMM yyyy", { locale: es }) : 
                    "No registrado"
                  }</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contract" className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3">Información del Contrato</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium">Fecha de inicio:</span> {
                  vehicle.contractStartDate ? 
                  format(new Date(vehicle.contractStartDate), "dd MMM yyyy", { locale: es }) : 
                  "No registrado"
                }</p>
                <p><span className="font-medium">Total de cuotas:</span> {vehicle.totalInstallments || 0}</p>
                <p><span className="font-medium">Monto por cuota:</span> Bs {vehicle.installmentAmount || 0}</p>
                <p><span className="font-medium">Monto total del contrato:</span> Bs {(vehicle.installmentAmount || 0) * (vehicle.totalInstallments || 0)}</p>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3">Estado de Pagos</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium">Cuotas pagadas:</span> {calculatedPaidInstallments}</p>
                <p><span className="font-medium">Cuotas restantes:</span> {remainingInstallments}</p>
                <p><span className="font-medium">Total pagado:</span> Bs {totalPaid}</p>
                <p><span className="font-medium">Saldo pendiente:</span> Bs {((vehicle.installmentAmount || 0) * (vehicle.totalInstallments || 0)) - totalPaid}</p>
                <p className="col-span-2"><span className="font-medium">Porcentaje completado:</span> {
                  vehicle.totalInstallments ? 
                  Math.round((calculatedPaidInstallments / vehicle.totalInstallments) * 100) : 
                  0
                }%</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-2">Historial de Pagos</h3>
              {vehiclePayments.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 text-left">Fecha</th>
                        <th className="p-2 text-left">Monto</th>
                        <th className="p-2 text-left">Concepto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehiclePayments.map(payment => (
                        <tr key={payment.id} className="border-b border-muted/30">
                          <td className="p-2">{format(new Date(payment.date), "dd MMM yyyy", { locale: es })}</td>
                          <td className="p-2">Bs {payment.amount}</td>
                          <td className="p-2">{payment.concept}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No hay pagos registrados</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Historial de Mantenimiento</h3>
              {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 text-left">Fecha</th>
                        <th className="p-2 text-left">Descripción</th>
                        <th className="p-2 text-left">Costo</th>
                        <th className="p-2 text-left">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicle.maintenanceHistory.map(maintenance => (
                        <tr key={maintenance.id} className="border-b border-muted/30">
                          <td className="p-2">{format(new Date(maintenance.date), "dd MMM yyyy", { locale: es })}</td>
                          <td className="p-2">{maintenance.description}</td>
                          <td className="p-2">Bs {maintenance.costMaterials}</td>
                          <td className="p-2">{
                            maintenance.status === "pending" ? "Pendiente" : 
                            maintenance.status === "in-progress" ? "En Proceso" : "Completado"
                          }</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No hay registros de mantenimiento</p>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Registrar Nuevo Mantenimiento</h3>
              <form onSubmit={handleSubmitMaintenance} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs">Fecha</label>
                    <input 
                      type="date" 
                      value={maintenance.date}
                      onChange={(e) => setMaintenance({...maintenance, date: e.target.value})}
                      className="w-full p-2 text-sm border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs">Costo de Materiales (Bs)</label>
                    <input 
                      type="number" 
                      value={maintenance.costMaterials}
                      onChange={(e) => setMaintenance({...maintenance, costMaterials: Number(e.target.value)})}
                      className="w-full p-2 text-sm border rounded"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs">Descripción</label>
                    <textarea 
                      value={maintenance.description}
                      onChange={(e) => setMaintenance({...maintenance, description: e.target.value})}
                      className="w-full p-2 text-sm border rounded h-20"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs">Precio de Venta (Bs)</label>
                    <input 
                      type="number" 
                      value={maintenance.salePrice}
                      onChange={(e) => setMaintenance({...maintenance, salePrice: Number(e.target.value)})}
                      className="w-full p-2 text-sm border rounded"
                      required
                    />
                  </div>
                </div>
                <div className="text-right">
                  <Button type="submit" size="sm">Registrar Mantenimiento</Button>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
