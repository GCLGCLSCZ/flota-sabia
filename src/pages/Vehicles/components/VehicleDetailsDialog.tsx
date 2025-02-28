
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle, Maintenance, CardexItem, Discount, InsurancePolicy, InsurancePayment } from "@/types";
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
  
  // Estado para nueva lógica de pago de seguros
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [installmentAmount, setInstallmentAmount] = useState(0);
  const [nextPaymentDate, setNextPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showInstalments, setShowInstalments] = useState(false);

  // Resto de estados
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
              {/* Contenido de la pestaña de detalles */}
            </div>
          </TabsContent>

          <TabsContent value="contract">
            {/* Contenido de la pestaña de contrato */}
          </TabsContent>

          <TabsContent value="maintenance">
            {/* Contenido de la pestaña de mantenimiento */}
          </TabsContent>

          <TabsContent value="cardex">
            {/* Contenido de la pestaña de cardex */}
          </TabsContent>

          <TabsContent value="discounts">
            {/* Contenido de la pestaña de descuentos */}
          </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pólizas de Seguro
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-3">Registrar Nueva Póliza</h4>

                  <form onSubmit={handleSubmitInsurancePolicy} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="policyNumber">Número de Póliza</Label>
                        <Input
                          id="policyNumber"
                          value={newInsurancePolicy.policyNumber}
                          onChange={(e) =>
                            setNewInsurancePolicy({
                              ...newInsurancePolicy,
                              policyNumber: e.target.value,
                            })
                          }
                          placeholder="Ej: POL-123456"
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Compañía Aseguradora</Label>
                        <Input
                          id="company"
                          value={newInsurancePolicy.company}
                          onChange={(e) =>
                            setNewInsurancePolicy({
                              ...newInsurancePolicy,
                              company: e.target.value,
                            })
                          }
                          placeholder="Ej: Seguros XYZ"
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="contact">Contacto</Label>
                        <Input
                          id="contact"
                          value={newInsurancePolicy.contact}
                          onChange={(e) =>
                            setNewInsurancePolicy({
                              ...newInsurancePolicy,
                              contact: e.target.value,
                            })
                          }
                          placeholder="Ej: Juan Pérez"
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Monto Total (Bs)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newInsurancePolicy.amount || ""}
                          onChange={(e) =>
                            setNewInsurancePolicy({
                              ...newInsurancePolicy,
                              amount: Number(e.target.value),
                            })
                          }
                          placeholder="0.00"
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="startDate">Fecha de Inicio</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newInsurancePolicy.startDate}
                          onChange={(e) =>
                            setNewInsurancePolicy({
                              ...newInsurancePolicy,
                              startDate: e.target.value,
                            })
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">Fecha de Fin</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newInsurancePolicy.endDate}
                          onChange={(e) =>
                            setNewInsurancePolicy({
                              ...newInsurancePolicy,
                              endDate: e.target.value,
                            })
                          }
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isInvestorPaying"
                        checked={newInsurancePolicy.isInvestorPaying}
                        onCheckedChange={(checked) =>
                          setNewInsurancePolicy({
                            ...newInsurancePolicy,
                            isInvestorPaying: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="isInvestorPaying" className="text-sm">
                        El inversionista paga la póliza
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showInstalments"
                        checked={showInstalments}
                        onCheckedChange={(checked) => setShowInstalments(checked as boolean)}
                      />
                      <Label htmlFor="showInstalments" className="text-sm">
                        Pagar en cuotas
                      </Label>
                    </div>

                    {showInstalments && (
                      <div className="border-t pt-3 mt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="totalInstallments">Número de Cuotas</Label>
                            <Input
                              id="totalInstallments"
                              type="number"
                              min="2"
                              value={totalInstallments}
                              onChange={(e) => setTotalInstallments(Number(e.target.value))}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="installmentAmount">Monto por Cuota (Bs)</Label>
                            <Input
                              id="installmentAmount"
                              type="number"
                              value={installmentAmount}
                              onChange={(e) => setInstallmentAmount(Number(e.target.value))}
                              className="h-8"
                              readOnly
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="nextPaymentDate">Fecha de la primera cuota</Label>
                          <Input
                            id="nextPaymentDate"
                            type="date"
                            value={nextPaymentDate}
                            onChange={(e) => setNextPaymentDate(e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      {editingPolicyId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEditPolicy}
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button type="submit">
                        {editingPolicyId ? "Actualizar Póliza" : "Registrar Póliza"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Formulario de pago */}
                {showPaymentForm && (
                  <div className="border p-4 rounded-md mt-4">
                    <h4 className="font-medium mb-3">Registrar Pago de Póliza</h4>
                    <form onSubmit={handleSubmitInsurancePayment} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="paymentDate">Fecha de Pago</Label>
                          <Input
                            id="paymentDate"
                            type="date"
                            value={newInsurancePayment.date}
                            onChange={(e) =>
                              setNewInsurancePayment({
                                ...newInsurancePayment,
                                date: e.target.value,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="paymentAmount">Monto (Bs)</Label>
                          <Input
                            id="paymentAmount"
                            type="number"
                            value={newInsurancePayment.amount || ""}
                            onChange={(e) =>
                              setNewInsurancePayment({
                                ...newInsurancePayment,
                                amount: Number(e.target.value),
                              })
                            }
                            placeholder="0.00"
                            className="h-8"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="paymentDescription">Descripción</Label>
                        <Input
                          id="paymentDescription"
                          value={newInsurancePayment.description}
                          onChange={(e) =>
                            setNewInsurancePayment({
                              ...newInsurancePayment,
                              description: e.target.value,
                            })
                          }
                          placeholder="Ej: Pago de cuota"
                          className="h-8"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowPaymentForm(false);
                            setSelectedPolicyId(null);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">Registrar Pago</Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-3">Pólizas Registradas</h4>
                {policiesWithNextPayments.length > 0 ? (
                  <div className="space-y-4">
                    {policiesWithNextPayments.map((policy) => (
                      <div key={policy.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{policy.policyNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {policy.company}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => handlePrepareAddPayment(policy.id)}
                            >
                              <DollarSign className="h-3.5 w-3.5 mr-1" />
                              Pago
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => handleEditPolicy(policy)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-destructive"
                              onClick={() => handleDeletePolicy(policy.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span>Monto total:</span>
                            <span className="font-medium">Bs {policy.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Período:</span>
                            <span>{format(new Date(policy.startDate), "dd/MM/yyyy")} - {format(new Date(policy.endDate), "dd/MM/yyyy")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Paga inversionista:</span>
                            <span>{policy.isInvestorPaying ? "Sí" : "No"}</span>
                          </div>
                        </div>
                        
                        {policy.isPaymentDue && (
                          <div className="mt-2 flex items-center gap-1 text-red-500 text-sm">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Pago pendiente: {format(new Date(policy.nextPaymentDate), "dd/MM/yyyy")}</span>
                          </div>
                        )}
                        
                        {policy.payments && policy.payments.length > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="text-sm font-medium">Pagos registrados:</h5>
                              <span className="text-xs text-muted-foreground">
                                {policy.payments.length} {policy.payments.length === 1 ? "pago" : "pagos"}
                              </span>
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {[...policy.payments]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((payment) => (
                                <div key={payment.id} className="flex justify-between items-center text-xs py-1 border-b last:border-0">
                                  <div>
                                    <div>{format(new Date(payment.date), "dd/MM/yyyy")}</div>
                                    <div className="text-muted-foreground text-xs">{payment.description}</div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Bs {payment.amount.toFixed(2)}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 rounded-full p-0 text-destructive"
                                      onClick={() => handleDeleteInsurancePayment(policy.id, payment.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border rounded-md p-8 text-center">
                    <Shield className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No hay pólizas registradas para este vehículo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registra una nueva póliza usando el formulario
                    </p>
                  </div>
                )}
              </div>
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
