import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle, Maintenance, CardexItem, Discount, InsurancePolicy, InsurancePayment } from "@/types";
import { useState, useEffect } from "react";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, AlertCircle, Save, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onAddMaintenance: (vehicleId: string, maintenance: Omit<Maintenance, "id" | "status">) => void;
}

const VehicleDetailsDialog = ({ vehicle, onClose, onAddMaintenance }: VehicleDetailsDialogProps) => {
  const [tab, setTab] = useState("details");
  const { payments, updateVehicle, investors, drivers } = useApp();
  const { toast } = useToast();
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<string | null>(null);
  const [maintenance, setMaintenance] = useState<Omit<Maintenance, "id" | "status">>({
    vehicleId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    cost: 0,
    costMaterials: 0,
    costLabor: 0,
    salePrice: 0,
    type: "mechanical",
    proformaNumber: "",
    isInsuranceCovered: false
  });
  
  const [newCardexItem, setNewCardexItem] = useState<Omit<CardexItem, "id" | "complete">>({
    vehicleId: "",
    type: "oil_change",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "Cambio de aceite",
    nextScheduledDate: format(addMonths(new Date(), 2), "yyyy-MM-dd"),
    kilometersAtService: 0,
    nextServiceKilometers: 10000,
    cost: 0
  });
  
  const [newDiscount, setNewDiscount] = useState<Omit<Discount, "id">>({
    vehicleId: "",
    type: "maintenance",
    description: "",
    amount: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    applyToMonths: [format(new Date(), "yyyy-MM")],
    recurring: false,
    frequency: "monthly"
  });

  // Estado para seguros
  const [newInsurancePolicy, setNewInsurancePolicy] = useState<Omit<InsurancePolicy, "id" | "payments">>({
    policyNumber: "",
    company: "",
    contact: "",
    amount: 0,
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addMonths(new Date(), 12), "yyyy-MM-dd"),
    isInvestorPaying: false
  });

  // Estado para nuevos pagos de seguros
  const [newInsurancePayment, setNewInsurancePayment] = useState<Omit<InsurancePayment, "id">>({
    date: format(new Date(), "yyyy-MM-dd"),
    amount: 0,
    description: "Pago de seguro"
  });

  // Estado para edición de póliza
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);

  // Estado para manejar la edición de información general
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);
  
  // Estado para manejar la edición del contrato
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [editedContract, setEditedContract] = useState<{
    contractStartDate?: string;
    totalInstallments?: number;
    installmentAmount?: number;
  } | null>(null);

  // Actualizar vehicleId cuando se selecciona un vehículo
  useEffect(() => {
    if (vehicle) {
      setMaintenance(prev => ({ ...prev, vehicleId: vehicle.id }));
      setNewCardexItem(prev => ({ ...prev, vehicleId: vehicle.id }));
      setNewDiscount(prev => ({ ...prev, vehicleId: vehicle.id }));
    }
  }, [vehicle]);

  if (!vehicle) return null;

  // Inicializar editedVehicle si no está configurado y estamos editando
  if (isEditingGeneral && !editedVehicle) {
    setEditedVehicle({ ...vehicle });
  }

  // Inicializar editedContract si no está configurado y estamos editando
  if (isEditingContract && !editedContract) {
    setEditedContract({
      contractStartDate: vehicle.contractStartDate,
      totalInstallments: vehicle.totalInstallments,
      installmentAmount: vehicle.installmentAmount,
    });
  }

  // Filtramos pagos correspondientes a este vehículo
  const vehiclePayments = payments.filter(p => p.vehicleId === vehicle.id && p.status === "completed");
  const totalPaid = vehiclePayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculamos cuotas pagadas en base al total pagado y el monto por cuota
  const calculatedPaidInstallments = vehicle.installmentAmount ? 
    Math.floor(totalPaid / vehicle.installmentAmount) : 
    vehicle.paidInstallments || 0;
  
  // Cuotas restantes
  const remainingInstallments = (vehicle.totalInstallments || 0) - calculatedPaidInstallments;

  // Calcular el costo total (materiales + mano de obra)
  const calculateTotalCost = () => {
    return maintenance.costMaterials + maintenance.costLabor;
  };

  // Calcular la ganancia (precio de venta - costo total)
  const calculateProfit = () => {
    const totalCost = calculateTotalCost();
    return maintenance.salePrice - totalCost;
  };

  // Obtener pólizas de seguro del vehículo
  const insurancePolicies = vehicle.insurancePolicies || [];

  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMaintenanceId) {
      // Actualizar mantenimiento existente
      if (!vehicle.maintenanceHistory) return;
      
      const updatedHistory = vehicle.maintenanceHistory.map(item => 
        item.id === editingMaintenanceId ? 
        { ...item, ...maintenance } : 
        item
      );
      
      updateVehicle(vehicle.id, { maintenanceHistory: updatedHistory });
      
      toast({
        title: "Mantenimiento actualizado",
        description: "El registro de mantenimiento ha sido actualizado exitosamente.",
      });
      
      setEditingMaintenanceId(null);
    } else {
      // Agregar nuevo mantenimiento
      onAddMaintenance(vehicle.id, maintenance);
    }
    
    // Reset form
    setMaintenance({
      vehicleId: vehicle.id,
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      cost: 0,
      costMaterials: 0,
      costLabor: 0,
      salePrice: 0,
      type: "mechanical",
      proformaNumber: "",
      isInsuranceCovered: false
    });
  };

  const handleEditMaintenance = (item: Maintenance) => {
    setEditingMaintenanceId(item.id);
    setMaintenance({
      vehicleId: item.vehicleId,
      date: item.date,
      description: item.description,
      cost: item.cost,
      costMaterials: item.costMaterials,
      costLabor: item.costLabor || 0, // Manejar posible valor null en registros antiguos
      salePrice: item.salePrice,
      type: item.type || "mechanical",
      proformaNumber: item.proformaNumber || "",
      isInsuranceCovered: item.isInsuranceCovered || false
    });
    
    // Mover a la pestaña de mantenimiento
    setTab("maintenance");
    
    // Hacer scroll al formulario
    setTimeout(() => {
      document.getElementById("maintenance-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDeleteMaintenance = (id: string) => {
    if (!vehicle.maintenanceHistory) return;
    
    const updatedHistory = vehicle.maintenanceHistory.filter(item => item.id !== id);
    updateVehicle(vehicle.id, { maintenanceHistory: updatedHistory });
    
    toast({
      title: "Mantenimiento eliminado",
      description: "El registro de mantenimiento ha sido eliminado exitosamente.",
      variant: "destructive"
    });
    
    if (editingMaintenanceId === id) {
      setEditingMaintenanceId(null);
      setMaintenance({
        vehicleId: vehicle.id,
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
        cost: 0,
        costMaterials: 0,
        costLabor: 0,
        salePrice: 0,
        type: "mechanical",
        proformaNumber: "",
        isInsuranceCovered: false
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditingMaintenanceId(null);
    setMaintenance({
      vehicleId: vehicle.id,
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      cost: 0,
      costMaterials: 0,
      costLabor: 0,
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
      vehicleId: vehicle.id,
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
      vehicleId: vehicle.id,
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

  // Calcular costo total cuando cambien los valores de costMaterials o costLabor
  const handleCostChange = (type: 'materials' | 'labor', value: number) => {
    if (type === 'materials') {
      setMaintenance({
        ...maintenance,
        costMaterials: value,
        cost: value + maintenance.costLabor
      });
    } else {
      setMaintenance({
        ...maintenance,
        costLabor: value,
        cost: maintenance.costMaterials + value
      });
    }
  };

  // Guardar cambios en la información general del vehículo
  const handleSaveGeneralInfo = async () => {
    if (!editedVehicle) return;
    
    try {
      const success = await updateVehicle(vehicle.id, {
        plate: editedVehicle.plate,
        brand: editedVehicle.brand,
        model: editedVehicle.model,
        year: editedVehicle.year,
        status: editedVehicle.status,
        investor: editedVehicle.investor,
        driverName: editedVehicle.driverName,
        driverPhone: editedVehicle.driverPhone,
        dailyRate: editedVehicle.dailyRate
      });
      
      if (success) {
        toast({
          title: "Información actualizada",
          description: "Los datos generales del vehículo han sido actualizados exitosamente.",
        });
        setIsEditingGeneral(false);
        setEditedVehicle(null);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron actualizar los datos del vehículo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar los datos.",
        variant: "destructive"
      });
    }
  };

  // Guardar cambios en la información del contrato
  const handleSaveContractInfo = async () => {
    if (!editedContract) return;
    
    try {
      const success = await updateVehicle(vehicle.id, {
        contractStartDate: editedContract.contractStartDate,
        totalInstallments: editedContract.totalInstallments,
        installmentAmount: editedContract.installmentAmount
      });
      
      if (success) {
        toast({
          title: "Contrato actualizado",
          description: "Los datos del contrato han sido actualizados exitosamente.",
        });
        setIsEditingContract(false);
        setEditedContract(null);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron actualizar los datos del contrato.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar los datos del contrato.",
        variant: "destructive"
      });
    }
  };

  // Manejar envío de póliza
  const handleSubmitInsurancePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPolicyId) {
      // Actualizar póliza existente
      if (!vehicle.insurancePolicies) return;
      
      const updatedPolicies = vehicle.insurancePolicies.map(policy => 
        policy.id === editingPolicyId ? 
        { 
          ...policy, 
          policyNumber: newInsurancePolicy.policyNumber,
          company: newInsurancePolicy.company,
          contact: newInsurancePolicy.contact,
          amount: newInsurancePolicy.amount,
          startDate: newInsurancePolicy.startDate,
          endDate: newInsurancePolicy.endDate,
          isInvestorPaying: newInsurancePolicy.isInvestorPaying
        } : 
        policy
      );
      
      updateVehicle(vehicle.id, { insurancePolicies: updatedPolicies });
      
      toast({
        title: "Póliza actualizada",
        description: "La póliza de seguro ha sido actualizada exitosamente.",
      });
      
      setEditingPolicyId(null);
    } else {
      // Agregar nueva póliza
      const newPolicy: InsurancePolicy = {
        id: Date.now().toString(),
        ...newInsurancePolicy,
        payments: []
      };
      
      const updatedPolicies = [...(vehicle.insurancePolicies || []), newPolicy];
      updateVehicle(vehicle.id, { insurancePolicies: updatedPolicies });
      
      toast({
        title: "Póliza agregada",
        description: "La póliza de seguro ha sido agregada exitosamente.",
      });
    }
    
    // Reset form
    setNewInsurancePolicy({
      policyNumber: "",
      company: "",
      contact: "",
      amount: 0,
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(addMonths(new Date(), 12), "yyyy-MM-dd"),
      isInvestorPaying: false
    });
  };

  // Manejar edición de póliza
  const handleEditPolicy = (policy: InsurancePolicy) => {
    setEditingPolicyId(policy.id);
    setNewInsurancePolicy({
      policyNumber: policy.policyNumber,
      company: policy.company,
      contact: policy.contact,
      amount: policy.amount,
      startDate: policy.startDate,
      endDate: policy.endDate,
      isInvestorPaying: policy.isInvestorPaying
    });
  };

  // Manejar eliminación de póliza
  const handleDeletePolicy = (id: string) => {
    if (!vehicle.insurancePolicies) return;
    
    const updatedPolicies = vehicle.insurancePolicies.filter(policy => policy.id !== id);
    updateVehicle(vehicle.id, { insurancePolicies: updatedPolicies });
    
    toast({
      title: "Póliza eliminada",
      description: "La póliza de seguro ha sido eliminada exitosamente.",
      variant: "destructive"
    });
    
    if (editingPolicyId === id) {
      setEditingPolicyId(null);
      setNewInsurancePolicy({
        policyNumber: "",
        company: "",
        contact: "",
        amount: 0,
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(addMonths(new Date(), 12), "yyyy-MM-dd"),
        isInvestorPaying: false
      });
    }
  };

  // Manejar envío de pago de seguro
  const handleSubmitInsurancePayment = (e: React.FormEvent, policyId: string) => {
    e.preventDefault();
    
    if (!vehicle.insurancePolicies) return;
    
    const paymentToAdd: InsurancePayment = {
      id: Date.now().toString(),
      ...newInsurancePayment
    };
    
    const updatedPolicies = vehicle.insurancePolicies.map(policy => {
      if (policy.id === policyId) {
        return {
          ...policy,
          payments: [...(policy.payments || []), paymentToAdd]
        };
      }
      return policy;
    });
    
    updateVehicle(vehicle.id, { insurancePolicies: updatedPolicies });
    
    toast({
      title: "Pago registrado",
      description: "El pago de seguro ha sido registrado exitosamente.",
    });
    
    // Reset form
    setNewInsurancePayment({
      date: format(new Date(), "yyyy-MM-dd"),
      amount: 0,
      description: "Pago de seguro"
    });
  };

  // Manejar eliminación de pago de seguro
  const handleDeleteInsurancePayment = (policyId: string, paymentId: string) => {
    if (!vehicle.insurancePolicies) return;
    
    const updatedPolicies = vehicle.insurancePolicies.map(policy => {
      if (policy.id === policyId) {
        return {
          ...policy,
          payments: policy.payments.filter(payment => payment.id !== paymentId)
        };
      }
      return policy;
    });
    
    updateVehicle(vehicle.id, { insurancePolicies: updatedPolicies });
    
    toast({
      title: "Pago eliminado",
      description: "El pago de seguro ha sido eliminado exitosamente.",
      variant: "destructive"
    });
  };

  // Cancelar edición de póliza
  const handleCancelEditPolicy = () => {
    setEditingPolicyId(null);
    setNewInsurancePolicy({
      policyNumber: "",
      company: "",
      contact: "",
      amount: 0,
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(addMonths(new Date(), 12), "yyyy-MM-dd"),
      isInvestorPaying: false
    });
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Vehículo: {vehicle.plate}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="details">Información General</TabsTrigger>
            <TabsTrigger value="contract">Contrato</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            <TabsTrigger value="cardex">Cardex</TabsTrigger>
            <TabsTrigger value="discounts">Descuentos</TabsTrigger>
            <TabsTrigger value="insurance">Seguros</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Información del Vehículo</h3>
                  {!isEditingGeneral ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setIsEditingGeneral(true)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        setIsEditingGeneral(false);
                        setEditedVehicle(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
                
                {!isEditingGeneral ? (
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
                ) : (
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="plate" className="text-xs">Placa</Label>
                      <Input 
                        id="plate" 
                        value={editedVehicle?.plate || ''} 
                        onChange={(e) => setEditedVehicle(prev => prev ? {...prev, plate: e.target.value} : null)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand" className="text-xs">Marca</Label>
                      <Input 
                        id="brand" 
                        value={editedVehicle?.brand || ''} 
                        onChange={(e) => setEditedVehicle(prev => prev ? {...prev, brand: e.target.value} : null)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="model" className="text-xs">Modelo</Label>
                      <Input 
                        id="model" 
                        value={editedVehicle?.model || ''} 
                        onChange={(e) => setEditedVehicle(prev => prev ? {...prev, model: e.target.value} : null)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year" className="text-xs">Año</Label>
                      <Input 
                        id="year" 
                        value={editedVehicle?.year || ''} 
                        onChange={(e) => setEditedVehicle(prev => prev ? {...prev, year: e.target.value} : null)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-xs">Estado</Label>
                      <Select 
                        value={editedVehicle?.status || 'active'} 
                        onValueChange={(value: 'active' | 'maintenance' | 'inactive') => 
                          setEditedVehicle(prev => prev ? {...prev, status: value} : null)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="maintenance">En Mantenimiento</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dailyRate" className="text-xs">Tarifa diaria (Bs)</Label>
                      <Input 
                        id="dailyRate" 
                        type="number"
                        value={editedVehicle?.dailyRate || 0} 
                        onChange={(e) => setEditedVehicle(prev => prev ? 
                          {...prev, dailyRate: Number(e.target.value)} : null
                        )}
                        className="h-8 text-sm"
                      />
                    </div>
                    <Button 
                      className="w-full mt-2 text-xs" 
                      size="sm"
                      onClick={handleSaveGeneralInfo}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Guardar cambios
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Información de Operación</h3>
                  {!isEditingGeneral ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setIsEditingGeneral(true)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  ) : null}
                </div>
                
                {!isEditingGeneral ? (
                  <div className="text-sm mt-2 space-y-1">
                    <p><span className="font-medium">Inversionista:</span> {vehicle.investor || "No asignado"}</p>
                    <p><span className="font-medium">Conductor:</span> {vehicle.driverName || "No asignado"}</p>
                    {vehicle.driverPhone && (
                      <p><span className="font-medium">Teléfono del conductor:</span> {vehicle.driverPhone}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="investor" className="text-xs">Inversionista</Label>
                      <Select 
                        value={editedVehicle?.investor || ''} 
                        onValueChange={(value) => 
                          setEditedVehicle(prev => prev ? {...prev, investor: value} : null)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Selecciona un inversionista" />
                        </SelectTrigger>
                        <SelectContent>
                          {investors.map(investor => (
                            <SelectItem key={investor.id} value={investor.name}>
                              {investor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="driverName" className="text-xs">Nombre del conductor</Label>
                      <Input 
                        id="driverName" 
                        value={editedVehicle?.driverName || ''} 
                        onChange={(e) => setEditedVehicle(prev => prev ? {...prev, driverName: e.target.value} : null)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverPhone" className="text-xs">Teléfono del conductor</Label>
                      <Input 
                        id="driverPhone" 
                        value={editedVehicle?.driverPhone || ''} 
                        onChange={(e) => setEditedVehicle(prev => prev ? {...prev, driverPhone: e.target.value} : null)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contract" className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold">Información del Contrato</h3>
                {!isEditingContract ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => setIsEditingContract(true)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setIsEditingContract(false);
                      setEditedContract(null);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
              
              {!isEditingContract ? (
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
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contractStartDate" className="text-xs">Fecha de inicio</Label>
                      <Input 
                        id="contractStartDate" 
                        type="date"
                        value={editedContract?.contractStartDate?.split('T')[0] || ''} 
                        onChange={(e) => setEditedContract(prev => prev ? 
                          {...prev, contractStartDate: e.target.value} : null
                        )}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalInstallments" className="text-xs">Total de cuotas</Label>
                      <Input 
                        id="totalInstallments" 
                        type="number"
                        value={editedContract?.totalInstallments || 0} 
                        onChange={(e) => setEditedContract(prev => prev ? 
                          {...prev, totalInstallments: Number(e.target.value)} : null
                        )}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="installmentAmount" className="text-xs">Monto por cuota (Bs)</Label>
                      <Input 
                        id="installmentAmount" 
                        type="number"
                        value={editedContract?.installmentAmount || 0} 
                        onChange={(e) => setEditedContract(prev => prev ? 
                          {...prev, installmentAmount: Number(e.target.value)} : null
                        )}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="self-end">
                      <p className="text-xs font-medium">
                        Monto total: Bs {((editedContract?.installmentAmount || 0) * (editedContract?.totalInstallments || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-2 text-xs" 
                    size="sm"
                    onClick={handleSaveContractInfo}
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Guardar cambios del contrato
                  </Button>
                </div>
              )}
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3">Estado de Pagos</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium">Cuotas pagadas:</span> {calculatedPaidInstallments}</p>
                <p><span className="font-medium">Cuotas restantes:</span> {remainingInstallments}</p>
