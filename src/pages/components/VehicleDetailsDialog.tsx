
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle, Maintenance, CardexItem, Discount, InsurancePolicy, InsurancePayment } from "@/types";
import { useState } from "react";
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
    vehicleId: "", // Inicializamos con un valor vacío
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
    vehicleId: "", // Inicializamos con un valor vacío
    type: "oil_change",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "Cambio de aceite",
    nextScheduledDate: format(addMonths(new Date(), 2), "yyyy-MM-dd"),
    kilometersAtService: 0,
    nextServiceKilometers: 10000,
    cost: 0
  });
  
  const [newDiscount, setNewDiscount] = useState<Omit<Discount, "id">>({
    vehicleId: "", // Inicializamos con un valor vacío
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

  if (!vehicle) return null;

  // Actualizamos los IDs del vehículo en los estados cuando se carga el vehículo
  if (maintenance.vehicleId === "" && vehicle) {
    setMaintenance(prevState => ({
      ...prevState,
      vehicleId: vehicle.id
    }));
  }
  
  if (newCardexItem.vehicleId === "" && vehicle) {
    setNewCardexItem(prevState => ({
      ...prevState,
      vehicleId: vehicle.id
    }));
  }
  
  if (newDiscount.vehicleId === "" && vehicle) {
    setNewDiscount(prevState => ({
      ...prevState,
      vehicleId: vehicle.id
    }));
  }

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
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 text-left">Fecha</th>
                        <th className="p-2 text-left">Tipo</th>
                        <th className="p-2 text-left">Descripción</th>
                        <th className="p-2 text-left">Proforma</th>
                        <th className="p-2 text-left">Seguro</th>
                        <th className="p-2 text-left">Materiales</th>
                        <th className="p-2 text-left">Mano de Obra</th>
                        <th className="p-2 text-left">Total</th>
                        <th className="p-2 text-left">Venta</th>
                        <th className="p-2 text-left">Ganancia</th>
                        <th className="p-2 text-left">Estado</th>
                        <th className="p-2 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicle.maintenanceHistory.map(maintenance => {
                        const totalCost = maintenance.cost;
                        const profit = maintenance.salePrice - totalCost;
                        const profitPercentage = totalCost > 0 ? Math.round((profit / totalCost) * 100) : 0;
                        
                        return (
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
                            <td className="p-2">Bs {maintenance.costLabor || 0}</td>
                            <td className="p-2">Bs {totalCost}</td>
                            <td className="p-2">Bs {maintenance.salePrice}</td>
                            <td className="p-2">
                              <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                                Bs {profit} ({profitPercentage}%)
                              </span>
                            </td>
                            <td className="p-2">{
                              maintenance.status === "pending" ? "Pendiente" : 
                              maintenance.status === "completed" ? "Completado" : "Cancelado"
                            }</td>
                            <td className="p-2">
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditMaintenance(maintenance)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteMaintenance(maintenance.id)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No hay registros de mantenimiento</p>
              )}
            </div>

            <div className="mt-4" id="maintenance-form">
              <h3 className="text-sm font-semibold mb-2">
                {editingMaintenanceId ? "Editar Mantenimiento" : "Registrar Nuevo Mantenimiento"}
                {editingMaintenanceId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCancelEdit}
                    className="ml-2 text-xs"
                  >
                    Cancelar edición
                  </Button>
                )}
              </h3>
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
                      onChange={(e) => handleCostChange('materials', Number(e.target.value))}
                      className="w-full p-2 text-sm border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs">Costo Mano de Obra (Bs)</label>
                    <Input 
                      type="number" 
                      value={maintenance.costLabor}
                      onChange={(e) => handleCostChange('labor', Number(e.target.value))}
                      className="w-full p-2 text-sm border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs">Costo Total (Bs)</label>
                    <Input 
                      type="number" 
                      value={maintenance.cost}
                      readOnly
                      className="w-full p-2 text-sm border rounded bg-gray-100"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Suma automática de materiales y mano de obra
                    </p>
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
                    <div className="flex items-center mt-1">
                      <p className={`text-xs ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Ganancia: Bs {calculateProfit().toFixed(2)} 
                        {maintenance.cost > 0 && ` (${Math.round((calculateProfit() / maintenance.cost) * 100)}%)`}
                      </p>
                      {calculateProfit() < 0 && (
                        <AlertCircle className="h-3 w-3 text-red-500 ml-1" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Button type="submit" size="sm">
                    {editingMaintenanceId ? "Actualizar Mantenimiento" : "Registrar Mantenimiento"}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="cardex" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Cardex de Mantenimiento</h3>
              {vehicle.cardex && vehicle.cardex.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0 z-10">
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
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0 z-10">
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

          <TabsContent value="insurance" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-1 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                Pólizas de Seguro
              </h3>
              {insurancePolicies && insurancePolicies.length > 0 ? (
                <div className="space-y-6">
                  {insurancePolicies.map((policy) => (
                    <div key={policy.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/30 p-3 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Póliza: {policy.policyNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {policy.company} • Contacto: {policy.contact}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPolicy(policy)}
                            className="h-7 text-xs"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDeletePolicy(policy.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Monto de la póliza</p>
                            <p className="font-medium">Bs {policy.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha inicio</p>
                            <p className="font-medium">{format(new Date(policy.startDate), "dd/MM/yyyy")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha fin</p>
                            <p className="font-medium">{format(new Date(policy.endDate), "dd/MM/yyyy")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pagado por</p>
                            <p className="font-medium">{policy.isInvestorPaying ? "Inversionista" : "Empresa"}</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Historial de pagos</h5>
                          {policy.payments && policy.payments.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                  <tr>
                                    <th className="p-2 text-left">Fecha</th>
                                    <th className="p-2 text-left">Monto</th>
                                    <th className="p-2 text-left">Descripción</th>
                                    <th className="p-2 text-left">Acciones</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {policy.payments.map(payment => (
                                    <tr key={payment.id} className="border-t">
                                      <td className="p-2">{format(new Date(payment.date), "dd/MM/yyyy")}</td>
                                      <td className="p-2">Bs {payment.amount}</td>
                                      <td className="p-2">{payment.description}</td>
                                      <td className="p-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs text-destructive hover:text-destructive"
                                          onClick={() => handleDeleteInsurancePayment(policy.id, payment.id)}
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
                            <p className="text-sm text-muted-foreground italic">No hay pagos registrados</p>
                          )}
                        </div>

                        {!policy.isInvestorPaying && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">Registrar nuevo pago</h5>
                            <form onSubmit={(e) => handleSubmitInsurancePayment(e, policy.id)} className="grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">Fecha</Label>
                                <Input
                                  type="date"
                                  value={newInsurancePayment.date}
                                  onChange={(e) => setNewInsurancePayment({...newInsurancePayment, date: e.target.value})}
                                  className="h-8 text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Monto (Bs)</Label>
                                <Input
                                  type="number"
                                  value={newInsurancePayment.amount}
                                  onChange={(e) => setNewInsurancePayment({...newInsurancePayment, amount: Number(e.target.value)})}
                                  className="h-8 text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Descripción</Label>
                                <Input
                                  type="text"
                                  value={newInsurancePayment.description}
                                  onChange={(e) => setNewInsurancePayment({...newInsurancePayment, description: e.target.value})}
                                  className="h-8 text-sm"
                                  required
                                />
                              </div>
                              <div className="col-span-3 text-right">
                                <Button type="submit" size="sm" className="text-xs">
                                  Registrar Pago
                                </Button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No hay pólizas de seguro registradas</p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">
                {editingPolicyId ? "Editar Póliza de Seguro" : "Registrar Nueva Póliza de Seguro"}
                {editingPolicyId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCancelEditPolicy}
                    className="ml-2 text-xs"
                  >
                    Cancelar edición
                  </Button>
                )}
              </h3>
              <form onSubmit={handleSubmitInsurancePolicy} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <Label className="text-xs">Número de Póliza</Label>
                    <Input 
                      value={newInsurancePolicy.policyNumber}
                      onChange={(e) => setNewInsurancePolicy({...newInsurancePolicy, policyNumber: e.target.value})}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label className="text-xs">Compañía Aseguradora</Label>
                    <Input 
                      value={newInsurancePolicy.company}
                      onChange={(e) => setNewInsurancePolicy({...newInsurancePolicy, company: e.target.value})}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label className="text-xs">Contacto</Label>
                    <Input 
                      value={newInsurancePolicy.contact}
                      onChange={(e) => setNewInsurancePolicy({...newInsurancePolicy, contact: e.target.value})}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label className="text-xs">Monto de la Póliza (Bs)</Label>
                    <Input 
                      type="number"
                      value={newInsurancePolicy.amount}
                      onChange={(e) => setNewInsurancePolicy({...newInsurancePolicy, amount: Number(e.target.value)})}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fecha de Inicio</Label>
                    <Input 
                      type="date"
                      value={newInsurancePolicy.startDate}
                      onChange={(e) => setNewInsurancePolicy({...newInsurancePolicy, startDate: e.target.value})}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fecha de Fin</Label>
                    <Input 
                      type="date"
                      value={newInsurancePolicy.endDate}
                      onChange={(e) => setNewInsurancePolicy({...newInsurancePolicy, endDate: e.target.value})}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mt-1">
                      <Checkbox 
                        id="isInvestorPaying"
                        checked={newInsurancePolicy.isInvestorPaying}
                        onCheckedChange={(checked) => 
                          setNewInsurancePolicy({...newInsurancePolicy, isInvestorPaying: !!checked})
                        }
                      />
                      <label 
                        htmlFor="isInvestorPaying" 
                        className="text-sm font-medium leading-none"
                      >
                        El inversionista paga este seguro
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Si el inversionista paga, se deshabilitará la opción de registrar pagos.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Button type="submit" size="sm">
                    {editingPolicyId ? "Actualizar Póliza" : "Registrar Póliza"}
                  </Button>
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
