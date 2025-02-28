import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle, Maintenance, CardexItem, Discount, InsurancePolicy, InsurancePayment, MaintenanceType } from "@/types";
import { useState, useEffect } from "react";
import { format, addMonths, addDays, parseISO, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, AlertCircle, Save, Shield, Plus, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  // Estado para nueva lógica de pago de seguros
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [installmentAmount, setInstallmentAmount] = useState(0);
  const [nextPaymentDate, setNextPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showInstalments, setShowInstalments] = useState(false);

  // Estado para edición de póliza
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

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

  // Calcular próximas fechas de pago para pólizas
  const calculateNextPaymentDates = () => {
    return insurancePolicies.map(policy => {
      // Si no hay pagos registrados, la próxima fecha es la fecha de inicio + 1 mes
      if (!policy.payments || policy.payments.length === 0) {
        return {
          ...policy,
          nextPaymentDate: format(addMonths(parseISO(policy.startDate), 1), "yyyy-MM-dd"),
          isPaymentDue: isAfter(new Date(), addMonths(parseISO(policy.startDate), 1))
        };
      }

      // Ordenar pagos por fecha
      const sortedPayments = [...policy.payments].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // La última fecha de pago
      const lastPaymentDate = parseISO(sortedPayments[0].date);
      
      // La próxima fecha es 1 mes después de la última
      const nextDate = format(addMonths(lastPaymentDate, 1), "yyyy-MM-dd");
      
      return {
        ...policy,
        nextPaymentDate: nextDate,
        isPaymentDue: isAfter(new Date(), parseISO(nextDate))
      };
    });
  };

  const policiesWithNextPayments = calculateNextPaymentDates();

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
      
      // Generar pagos programados si se seleccionó la opción
      if (showInstalments && totalInstallments > 1) {
        const payments: InsurancePayment[] = [];
        const paymentInterval = 30; // Intervalo en días entre pagos
        let paymentDate = new Date(nextPaymentDate);
        
        for (let i = 0; i < totalInstallments; i++) {
          if (i > 0) {
            paymentDate = addDays(paymentDate, paymentInterval);
          }
          
          payments.push({
            id: `${newPolicy.id}-payment-${i+1}`,
            date: format(paymentDate, "yyyy-MM-dd"),
            amount: installmentAmount,
            description: `Cuota ${i+1} de ${totalInstallments} - Póliza ${newInsurancePolicy.policyNumber}`
          });
        }
        
        newPolicy.payments = payments;
        
        // Agregar notificación para el pago inicial
        toast({
          title: "Pagos programados",
          description: `Se han programado ${totalInstallments} pagos para esta póliza, con el primer pago el ${format(new Date(nextPaymentDate), "PPP", { locale: es })}`,
        });
      }
      
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
    setTotalInstallments(1);
    setInstallmentAmount(0);
    setNextPaymentDate(format(new Date(), "yyyy-MM-dd"));
    setShowInstalments(false);
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

  // Preparar formulario para agregar pago a una póliza
  const handlePrepareAddPayment = (policyId: string) => {
    setSelectedPolicyId(policyId);
    setShowPaymentForm(true);
    
    // Obtener la póliza seleccionada
    const policy = insurancePolicies.find(p => p.id === policyId);
    if (policy) {
      // Calcular el monto de la cuota si está en instalments
      if (policy.payments && policy.payments.length > 0) {
        // Usar el mismo monto que el último pago
        const lastPayment = policy.payments[policy.payments.length - 1];
        setNewInsurancePayment({
          date: format(new Date(), "yyyy-MM-dd"),
          amount: lastPayment.amount,
          description: `Pago de seguro - Póliza ${policy.policyNumber}`
        });
      } else {
        // Si no hay pagos previos, sugerir el monto total
        setNewInsurancePayment({
          date: format(new Date(), "yyyy-MM-dd"),
          amount: policy.amount,
          description: `Pago de seguro - Póliza ${policy.policyNumber}`
        });
      }
    }
  };

  // Manejar envío de pago de seguro
  const handleSubmitInsurancePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle.insurancePolicies || !selectedPolicyId) return;
    
    const paymentToAdd: InsurancePayment = {
      id: Date.now().toString(),
      ...newInsurancePayment
    };
    
    const updatedPolicies = vehicle.insurancePolicies.map(policy => {
      if (policy.id === selectedPolicyId) {
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
    setShowPaymentForm(false);
    setSelectedPolicyId(null);
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

  // Actualizar el monto de cuota cuando cambia el monto total o el número de cuotas
  useEffect(() => {
    if (totalInstallments > 0 && newInsurancePolicy.amount > 0) {
      setInstallmentAmount(Math.round(newInsurancePolicy.amount / totalInstallments));
    }
  }, [totalInstallments, newInsurancePolicy.amount]);

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
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Placa</Label>
                    {!isEditingGeneral ? (
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingGeneral(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setIsEditingGeneral(false);
                          setEditedVehicle(null);
                        }}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSaveGeneralInfo}>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                      </div>
                    )}
                  </div>
                  {isEditingGeneral ? (
                    <Input
                      value={editedVehicle?.plate || ""}
                      onChange={(e) => setEditedVehicle({ ...editedVehicle, plate: e.target.value })}
                      placeholder="Placa del vehículo"
                    />
                  ) : (
                    <div className="font-medium">{vehicle.plate}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Marca</Label>
                  {isEditingGeneral ? (
                    <Input
                      value={editedVehicle?.brand || ""}
                      onChange={(e) => setEditedVehicle({ ...editedVehicle, brand: e.target.value })}
                      placeholder="Marca del vehículo"
                    />
                  ) : (
                    <div className="font-medium">{vehicle.brand}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Modelo</Label>
                  {isEditingGeneral ? (
                    <Input
                      value={editedVehicle?.model || ""}
                      onChange={(e) => setEditedVehicle({ ...editedVehicle, model: e.target.value })}
                      placeholder="Modelo del vehículo"
                    />
                  ) : (
                    <div className="font-medium">{vehicle.model}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Año</Label>
                  {isEditingGeneral ? (
                    <Input
                      type="number"
                      value={editedVehicle?.year || ""}
                      onChange={(e) => setEditedVehicle({ ...editedVehicle, year: Number(e.target.value) })}
                      placeholder="Año del vehículo"
                    />
                  ) : (
                    <div className="font-medium">{vehicle.year}</div>
                  )}
                </div>
              </div>

              <div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  {isEditingGeneral ? (
                    <Select
                      value={editedVehicle?.status || "active"}
                      onValueChange={(value: "active" | "maintenance" | "inactive") =>
                        setEditedVehicle({ ...editedVehicle, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="maintenance">En Mantenimiento</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="font-medium">
                      {vehicle.status === "active" ? "Activo" : vehicle.status === "maintenance" ? "En Mantenimiento" : "Inactivo"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Inversionista</Label>
                  {isEditingGeneral ? (
                    <Input
                      value={editedVehicle?.investor || ""}
                      onChange={(e) => setEditedVehicle({ ...editedVehicle, investor: e.target.value })}
                      placeholder="Inversionista"
                    />
                  ) : (
                    <div className="font-medium">{vehicle.investor || "Sin asignar"}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Conductor</Label>
                  {isEditingGeneral ? (
                    <>
                      <Input
                        value={editedVehicle?.driverName || ""}
                        onChange={(e) => setEditedVehicle({ ...editedVehicle, driverName: e.target.value })}
                        placeholder="Nombre del conductor"
                      />
                      <Input
                        value={editedVehicle?.driverPhone || ""}
                        onChange={(e) => setEditedVehicle({ ...editedVehicle, driverPhone: e.target.value })}
                        placeholder="Teléfono del conductor"
                      />
                    </>
                  ) : (
                    <>
                      <div className="font-medium">{vehicle.driverName || "Sin asignar"}</div>
                      <div className="font-medium">{vehicle.driverPhone || "Sin asignar"}</div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tarifa Diaria</Label>
                  {isEditingGeneral ? (
                    <Input
                      type="number"
                      value={editedVehicle?.dailyRate || ""}
                      onChange={(e) => setEditedVehicle({ ...editedVehicle, dailyRate: Number(e.target.value) })}
                      placeholder="Tarifa Diaria"
                    />
                  ) : (
                    <div className="font-medium">{vehicle.dailyRate}</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contract">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Fecha de Inicio del Contrato</Label>
                    {!isEditingContract ? (
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingContract(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setIsEditingContract(false);
                          setEditedContract(null);
                        }}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSaveContractInfo}>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                      </div>
                    )}
                  </div>
                  {isEditingContract ? (
                    <Input
                      type="date"
                      value={editedContract?.contractStartDate || ""}
                      onChange={(e) => setEditedContract({ ...editedContract, contractStartDate: e.target.value })}
                      placeholder="Fecha de Inicio del Contrato"
                    />
                  ) : (
                    <div className="font-medium">{vehicle.contractStartDate ? format(new Date(vehicle.contractStartDate), "dd/MM/yyyy") : "Sin asignar"}</div>
                  )}
                </div>
              </div>

              <div>
                <div className="space-y-2">
                  <Label>Total de Cuotas</Label>
                  {isEditingContract ? (
                    <Input
                      type="number"
                      value={editedContract?.totalInstallments || ""}
                      onChange={(e) => setEditedContract({ ...editedContract, totalInstallments: Number
