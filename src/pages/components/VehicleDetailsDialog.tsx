
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle, Maintenance, CardexItem, Discount } from "@/types";
import { useState } from "react";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onAddMaintenance: (vehicleId: string, maintenance: Omit<Maintenance, "id" | "status">) => void;
}

const VehicleDetailsDialog = ({ vehicle, onClose, onAddMaintenance }: VehicleDetailsDialogProps) => {
  const [tab, setTab] = useState("details");
  const { payments, updateVehicle } = useApp();
  const [maintenance, setMaintenance] = useState<Omit<Maintenance, "id" | "status">>({
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    cost: 0,
    costMaterials: 0,
    salePrice: 0,
    type: "mechanical",
    proformaNumber: "",
    isInsuranceCovered: false
  });
  
  const [newCardexItem, setNewCardexItem] = useState<Omit<CardexItem, "id" | "complete">>({
    type: "oil_change",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "Cambio de aceite",
    nextScheduledDate: format(addMonths(new Date(), 2), "yyyy-MM-dd"),
    kilometersAtService: 0,
    nextServiceKilometers: 10000,
    cost: 0
  });
  
  const [newDiscount, setNewDiscount] = useState<Omit<Discount, "id">>({
    type: "maintenance",
    description: "",
    amount: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    applyToMonths: [format(new Date(), "yyyy-MM")],
    recurring: false,
    frequency: "monthly"
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
      cost: 0,
      costMaterials: 0,
      salePrice: 0,
      type: "mechanical",
      proformaNumber: "",
      isInsuranceCovered: false
    });
  };
  
  const handleSubmitCardexItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cardexItem: CardexItem = {
      id: Date.now().toString(),
      ...newCardexItem,
      complete: false
    };
    
    const updatedCardex = [...(vehicle.cardex || []), cardexItem];
    updateVehicle(vehicle.id, { cardex: updatedCardex });
    
    // Reset form
    setNewCardexItem({
      type: "oil_change",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "Cambio de aceite",
      nextScheduledDate: format(addMonths(new Date(), 2), "yyyy-MM-dd"),
      kilometersAtService: 0,
      nextServiceKilometers: 10000,
      cost: 0
    });
  };
  
  const handleSubmitDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const discount: Discount = {
      id: Date.now().toString(),
      ...newDiscount
    };
    
    const updatedDiscounts = [...(vehicle.discounts || []), discount];
    updateVehicle(vehicle.id, { discounts: updatedDiscounts });
    
    // Reset form
    setNewDiscount({
      type: "maintenance",
      description: "",
      amount: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      applyToMonths: [format(new Date(), "yyyy-MM")],
      recurring: false,
      frequency: "monthly"
    });
  };
  
  const handleToggleRecurring = (value: boolean) => {
    setNewDiscount({
      ...newDiscount,
      recurring: value
    });
  };
  
  const handleDeleteCardexItem = (id: string) => {
    if (!vehicle.cardex) return;
    const updatedCardex = vehicle.cardex.filter(item => item.id !== id);
    updateVehicle(vehicle.id, { cardex: updatedCardex });
  };
  
  const handleDeleteDiscount = (id: string) => {
    if (!vehicle.discounts) return;
    const updatedDiscounts = vehicle.discounts.filter(item => item.id !== id);
    updateVehicle(vehicle.id, { discounts: updatedDiscounts });
  };
  
  const handleCompleteCardexItem = (id: string, complete: boolean) => {
    if (!vehicle.cardex) return;
    const updatedCardex = vehicle.cardex.map(item => 
      item.id === id ? { ...item, complete } : item
    );
    updateVehicle(vehicle.id, { cardex: updatedCardex });
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalles del Vehículo: {vehicle.plate}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="details">Información General</TabsTrigger>
            <TabsTrigger value="contract">Contrato</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            <TabsTrigger value="cardex">Cardex</TabsTrigger>
            <TabsTrigger value="discounts">Descuentos</TabsTrigger>
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
                        <th className="p-2 text-left">Tipo</th>
                        <th className="p-2 text-left">Descripción</th>
                        <th className="p-2 text-left">Proforma</th>
                        <th className="p-2 text-left">Seguro</th>
                        <th className="p-2 text-left">Costo Mat.</th>
                        <th className="p-2 text-left">Costo Total</th>
                        <th className="p-2 text-left">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicle.maintenanceHistory.map(maintenance => (
                        <tr key={maintenance.id} className="border-b border-muted/30">
                          <td className="p-2">{format(new Date(maintenance.date), "dd MMM yyyy", { locale: es })}</td>
                          <td className="p-2">
                            {maintenance.type === "mechanical" ? "Mecánica" : 
                             maintenance.type === "body_paint" ? "Chapería y Pintura" : "General"}
                          </td>
                          <td className="p-2">{maintenance.description}</td>
                          <td className="p-2">{maintenance.proformaNumber || "-"}</td>
                          <td className="p-2">{maintenance.isInsuranceCovered ? "Sí" : "No"}</td>
                          <td className="p-2">Bs {maintenance.costMaterials}</td>
                          <td className="p-2">Bs {maintenance.cost}</td>
                          <td className="p-2">{
                            maintenance.status === "pending" ? "Pendiente" : 
                            maintenance.status === "completed" ? "Completado" : "Cancelado"
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
                    <Input 
                      type="date" 
                      value={maintenance.date}
                      onChange={(e) => setMaintenance({...maintenance, date: e.target.value})}
                      className="w-full p-2 text-sm border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs">Tipo de Mantenimiento</label>
                    <Select
                      value={maintenance.type}
                      onValueChange={(value: "mechanical" | "body_paint") => 
                        setMaintenance({...maintenance, type: value})
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mechanical">Mecánica</SelectItem>
                        <SelectItem value="body_paint">Chapería y Pintura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs">Descripción</label>
                    <textarea 
                      value={maintenance.description}
                      onChange={(e) => setMaintenance({...maintenance, description: e.target.value})}
                      className="w-full p-2 text-sm border rounded h-20 bg-[#F1F1F1] dark:bg-zinc-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs">Número de Proforma</label>
                    <Input 
                      type="text" 
                      value={maintenance.proformaNumber}
                      onChange={(e) => setMaintenance({...maintenance, proformaNumber: e.target.value})}
                      className="w-full p-2 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox 
                        id="isInsuranceCovered"
                        checked={maintenance.isInsuranceCovered}
                        onCheckedChange={(checked) => 
                          setMaintenance({...maintenance, isInsuranceCovered: !!checked})
                        }
                        className="bg-[#F1F1F1] dark:bg-zinc-800"
                      />
                      <label 
                        htmlFor="isInsuranceCovered" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Cubierto por Seguro
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs">Costo de Materiales (Bs)</label>
                    <Input 
                      type="number" 
                      value={maintenance.costMaterials}
                      onChange={(e) => setMaintenance({...maintenance, costMaterials: Number(e.target.value)})}
                      className="w-full p-2 text-sm border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs">Costo Total (Bs)</label>
                    <Input 
                      type="number" 
                      value={maintenance.cost}
                      onChange={(e) => setMaintenance({...maintenance, cost: Number(e.target.value)})}
                      className="w-full p-2 text-sm border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs">Precio de Venta (Bs)</label>
                    <Input 
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
          
          <TabsContent value="cardex" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Cardex de Mantenimiento</h3>
              {vehicle.cardex && vehicle.cardex.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 text-left">Servicio</th>
                        <th className="p-2 text-left">Fecha</th>
                        <th className="p-2 text-left">Próximo</th>
                        <th className="p-2 text-left">Km</th>
                        <th className="p-2 text-left">Costo</th>
                        <th className="p-2 text-left">Estado</th>
                        <th className="p-2 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicle.cardex.map(item => (
                        <tr key={item.id} className={`border-b border-muted/30 ${item.complete ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
                          <td className="p-2">
                            <div className="font-medium">{item.description}</div>
                            <div className="text-xs text-muted-foreground">{
                              item.type === "oil_change" ? "Cambio Aceite" :
                              item.type === "filter_change" ? "Cambio Filtros" :
                              item.type === "spark_plugs" ? "Bujías" :
                              item.type === "battery" ? "Batería" : "Otro"
                            }</div>
                          </td>
                          <td className="p-2">{format(new Date(item.date), "dd/MM/yyyy")}</td>
                          <td className="p-2">{item.nextScheduledDate ? format(new Date(item.nextScheduledDate), "dd/MM/yyyy") : "N/A"}</td>
                          <td className="p-2">
                            {item.kilometersAtService} 
                            {item.nextServiceKilometers && <> → {item.nextServiceKilometers}</>}
                          </td>
                          <td className="p-2">Bs {item.cost}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${item.complete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {item.complete ? 'Completado' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleCompleteCardexItem(item.id, !item.complete)}
                                className="h-6 px-2"
                              >
                                {item.complete ? 'Reabrir' : 'Completar'}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteCardexItem(item.id)}
                                className="h-6 px-2 text-red-500 hover:text-red-700"
                              >
                                Eliminar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No hay registros en el cardex</p>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Agregar Nuevo Servicio al Cardex</h3>
              <form onSubmit={handleSubmitCardexItem} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo de Servicio</Label>
                    <Select
                      value={newCardexItem.type}
                      onValueChange={(value: "oil_change" | "filter_change" | "spark_plugs" | "battery" | "other") => 
                        setNewCardexItem({...newCardexItem, type: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oil_change">Cambio de Aceite</SelectItem>
                        <SelectItem value="filter_change">Cambio de Filtros</SelectItem>
                        <SelectItem value="spark_plugs">Bujías</SelectItem>
                        <SelectItem value="battery">Batería</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fecha del Servicio</Label>
                    <Input 
                      type="date" 
                      value={newCardexItem.date}
                      onChange={(e) => setNewCardexItem({...newCardexItem, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descripción</Label>
                    <Input 
                      type="text" 
                      value={newCardexItem.description}
                      onChange={(e) => setNewCardexItem({...newCardexItem, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Costo (Bs)</Label>
                    <Input 
                      type="number" 
                      value={newCardexItem.cost}
                      onChange={(e) => setNewCardexItem({...newCardexItem, cost: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Kilómetros Actuales</Label>
                    <Input 
                      type="number" 
                      value={newCardexItem.kilometersAtService}
                      onChange={(e) => setNewCardexItem({...newCardexItem, kilometersAtService: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Próximo Servicio (Km)</Label>
                    <Input 
                      type="number" 
                      value={newCardexItem.nextServiceKilometers}
                      onChange={(e) => setNewCardexItem({...newCardexItem, nextServiceKilometers: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fecha Próximo Servicio</Label>
                    <Input 
                      type="date" 
                      value={newCardexItem.nextScheduledDate}
                      onChange={(e) => setNewCardexItem({...newCardexItem, nextScheduledDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <Button type="submit" size="sm">Agregar al Cardex</Button>
                </div>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="discounts" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Descuentos Registrados</h3>
              {vehicle.discounts && vehicle.discounts.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 text-left">Descripción</th>
                        <th className="p-2 text-left">Tipo</th>
                        <th className="p-2 text-left">Monto</th>
                        <th className="p-2 text-left">Fecha</th>
                        <th className="p-2 text-left">Recurrencia</th>
                        <th className="p-2 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicle.discounts.map(discount => (
                        <tr key={discount.id} className="border-b border-muted/30">
                          <td className="p-2 font-medium">{discount.description}</td>
                          <td className="p-2">{
                            discount.type === "insurance" ? "Seguro" :
                            discount.type === "repair" ? "Reparación" :
                            discount.type === "maintenance" ? "Mantenimiento" : "Otro"
                          }</td>
                          <td className="p-2 text-red-600">-Bs {discount.amount}</td>
                          <td className="p-2">{format(new Date(discount.date), "dd/MM/yyyy")}</td>
                          <td className="p-2">
                            {discount.recurring ? (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {discount.frequency === "monthly" ? "Mensual" :
                                 discount.frequency === "quarterly" ? "Trimestral" :
                                 discount.frequency === "biannual" ? "Semestral" : "Anual"}
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                Único
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteDiscount(discount.id)}
                              className="h-6 px-2 text-red-500 hover:text-red-700"
                            >
                              Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No hay descuentos registrados</p>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Agregar Nuevo Descuento</h3>
              <form onSubmit={handleSubmitDiscount} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo de Descuento</Label>
                    <Select
                      value={newDiscount.type}
                      onValueChange={(value: "insurance" | "repair" | "maintenance" | "other") => 
                        setNewDiscount({...newDiscount, type: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="insurance">Seguro</SelectItem>
                        <SelectItem value="repair">Reparación</SelectItem>
                        <SelectItem value="maintenance">Mantenimiento</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Monto (Bs)</Label>
                    <Input 
                      type="number" 
                      value={newDiscount.amount}
                      onChange={(e) => setNewDiscount({...newDiscount, amount: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Descripción</Label>
                    <Input 
                      type="text" 
                      value={newDiscount.description}
                      onChange={(e) => setNewDiscount({...newDiscount, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fecha</Label>
                    <Input 
                      type="date" 
                      value={newDiscount.date}
                      onChange={(e) => setNewDiscount({...newDiscount, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">¿Es recurrente?</Label>
                    <Select
                      value={newDiscount.recurring ? "true" : "false"}
                      onValueChange={(value) => handleToggleRecurring(value === "true")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sí</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newDiscount.recurring && (
                    <div className="space-y-1">
                      <Label className="text-xs">Frecuencia</Label>
                      <Select
                        value={newDiscount.frequency}
                        onValueChange={(value: "monthly" | "quarterly" | "biannual" | "annual") => 
                          setNewDiscount({...newDiscount, frequency: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="biannual">Semestral</SelectItem>
                          <SelectItem value="annual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Mes de aplicación</Label>
                    <div className="text-xs text-muted-foreground mb-1">
                      Para descuentos recurrentes, se aplicará según la frecuencia seleccionada a partir de este mes.
                    </div>
                    <Input 
                      type="month" 
                      value={newDiscount.applyToMonths[0]}
                      onChange={(e) => setNewDiscount({
                        ...newDiscount, 
                        applyToMonths: [e.target.value]
                      })}
                      required
                    />
                  </div>
                </div>
                <div className="text-right">
                  <Button type="submit" size="sm">Agregar Descuento</Button>
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
