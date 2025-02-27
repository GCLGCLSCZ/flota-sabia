import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { format, parse, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Car, FileText, Printer, Wifi, AlertTriangle, InfoIcon, Wrench, CheckCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "./settlement-print.css";

const InvestorSettlement = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { investors, vehicles, payments, settings, addPayment, updatePayment } = useApp();
  const { toast } = useToast();
  
  // Estado para la funcionalidad de pago
  const [showPaymentDialog, setShowNewPaymentDialog] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    transferNumber: "",
    amount: 0
  });
  const [paymentRegistered, setPaymentRegistered] = useState(false);
  const [recentPaymentId, setRecentPaymentId] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0); // Estado para forzar la actualización
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  // Estado para la gestión del mes seleccionado
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const monthStart = useMemo(() => startOfMonth(parse(selectedMonth, "yyyy-MM", new Date())), [selectedMonth]);
  const monthEnd = useMemo(() => endOfMonth(parse(selectedMonth, "yyyy-MM", new Date())), [selectedMonth]);

  // Obtener el inversionista actual
  const investor = useMemo(() => {
    return investors.find((investor) => investor.id === id);
  }, [investors, id]);

  // Obtener los vehículos del inversionista
  const investorVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => vehicle.investor === investor?.name);
  }, [vehicles, investor?.name]);

  // Obtener el último pago registrado para este inversionista en el mes seleccionado
  const latestPayment = useMemo(() => {
    if (!investor) return null;

    return payments
      .filter(p => 
        p.status === "completed" && 
        (p.concept.includes(`inversionista: ${investor?.name}`) || 
         (p.concept.includes(investorVehicles[0]?.plate) && p.concept.toLowerCase().includes("inversionista"))) &&
        isWithinInterval(parseISO(p.date), { start: monthStart, end: monthEnd })
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
  }, [payments, monthStart, monthEnd, investor, investorVehicles]);

  // Calcular el total a pagar al inversionista
  const calculateTotalToPay = (vehicle: any) => {
    if (!vehicle) return 0;
    return vehicle.dailyRate * 30;
  };

  // Calcular el total pagado al inversionista
  const calculatePaidToInvestor = (vehicle: any, payments: any[]) => {
    if (!vehicle || !payments) return 0;
    return payments.reduce((acc, payment) => acc + payment.amount, 0);
  };

  // Calcular el total pendiente a pagar al inversionista
  const calculatePendingToPay = (vehicle: any, totalToPay: number, paidToInvestor: number) => {
    if (!vehicle) return 0;
    return totalToPay - paidToInvestor;
  };

  // Calcular cuotas pagadas
  const calculatePaidInstallments = (vehicle: any, payments: any[]) => {
    if (!vehicle || !payments || !vehicle.installmentAmount) return 0;
    
    const totalPaid = payments.reduce((acc, payment) => acc + payment.amount, 0);
    return totalPaid / vehicle.installmentAmount;
  };
  
  // Calcular la rendición de cuentas para el mes seleccionado
  const settlementData = useMemo(() => {
    if (!investor || !settings) return [];
    
    const monthStart = startOfMonth(parse(selectedMonth, "yyyy-MM", new Date()));
    const monthEnd = endOfMonth(parse(selectedMonth, "yyyy-MM", new Date()));
    
    return investorVehicles.map(vehicle => {
      const totalToPay = calculateTotalToPay(vehicle);
      
      // Filtrar pagos que corresponden a este vehículo y período
      const periodPayments = payments
        .filter(p => 
          p.vehicleId === vehicle.id && 
          p.status === "completed" && 
          (p.concept.includes(`inversionista: ${investor?.name}`) || 
           (p.concept.includes(vehicle.plate) && p.concept.toLowerCase().includes("inversionista"))) &&
          isWithinInterval(parseISO(p.date), { start: monthStart, end: monthEnd })
        );
      
      console.log("Period payments for vehicle", vehicle.plate, ":", periodPayments);
      
      const paidToInvestor = calculatePaidToInvestor(vehicle, periodPayments);
      const pendingToPay = calculatePendingToPay(vehicle, totalToPay, paidToInvestor);
      const paidInstallments = calculatePaidInstallments(vehicle, periodPayments);
      
      return {
        vehicle,
        totalToPay,
        paidToInvestor,
        pendingToPay,
        paidInstallments,
        periodPayments
      };
    });
  }, [investorVehicles, selectedMonth, payments, settings, forceUpdate, investor?.name]);

  // Calcular los totales
  const totals = useMemo(() => {
    let totalToPay = 0;
    let paidToInvestor = 0;
    let pendingToPay = 0;
    
    settlementData.forEach(item => {
      totalToPay += item.totalToPay;
      paidToInvestor += item.paidToInvestor;
      pendingToPay += item.pendingToPay;
    });
    
    return {
      totalToPay,
      paidToInvestor,
      pendingToPay
    };
  }, [settlementData]);

  // Función para abrir el diálogo de pago
  const openPaymentDialog = () => {
    setShowNewPaymentDialog(true);
  };

  // Función para cerrar el diálogo de pago
  const closePaymentDialog = () => {
    setShowNewPaymentDialog(false);
  };

  // Función para editar un pago existente
  const handleEditPayment = () => {
    if (!latestPayment) return;
    
    setIsEditingPayment(true);
    setPaymentInfo({
      id: latestPayment.id,
      date: latestPayment.date,
      transferNumber: latestPayment.transferNumber || "",
      amount: latestPayment.amount
    });
    setShowNewPaymentDialog(true);
  };

  // Función para eliminar un pago
  const deletePayment = () => {
    if (!paymentToDelete) return;
    
    // Actualizar el estado del pago a "cancelled"
    updatePayment(paymentToDelete, {
      status: "cancelled"
    });
    
    // Mostrar notificación
    toast({
      title: "Pago eliminado",
      description: "El pago ha sido eliminado exitosamente"
    });
    
    // Cerrar diálogo y actualizar datos
    setShowDeleteDialog(false);
    setPaymentToDelete(null);
    setForceUpdate(prev => prev + 1);
  };
  
  // Iniciar proceso de eliminación
  const handleDeletePayment = () => {
    if (!latestPayment) return;
    
    setPaymentToDelete(latestPayment.id);
    setShowDeleteDialog(true);
  };
  
  // Manejar el registro o actualización de un pago
  const handlePaymentSubmit = () => {
    if (!investor) return;
    
    const monthLabel = format(parse(selectedMonth, "yyyy-MM", new Date()), "MMMM yyyy", { locale: es });
    
    if (isEditingPayment) {
      // Actualizar pago existente
      if (!paymentInfo.id) return;
      
      updatePayment(paymentInfo.id, {
        date: paymentInfo.date,
        amount: paymentInfo.amount,
        transferNumber: paymentInfo.transferNumber
      });
      
      setRecentPaymentId(paymentInfo.id);
      setPaymentRegistered(true);
      toast({
        title: "Pago actualizado",
        description: "El pago ha sido actualizado exitosamente"
      });
      
      // Forzar la actualización de los cálculos
      setForceUpdate(prev => prev + 1);
    } else {
      // Registrar nuevo pago
      const concept = `Pago a inversionista: ${investor.name} - ${monthLabel}`;
      
      const paymentData = {
        vehicleId: investorVehicles[0]?.id,
        date: paymentInfo.date,
        amount: paymentInfo.amount,
        concept: concept,
        paymentMethod: "transfer",
        status: "completed",
        bankName: "Banco Ganadero",
        transferNumber: paymentInfo.transferNumber
      };
      
      addPayment(paymentData);
      
      setRecentPaymentId(paymentData.id);
      setPaymentRegistered(true);
      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente"
      });
      
      // Forzar la actualización de los cálculos
      setForceUpdate(prev => prev + 1);
    }
    
    setShowNewPaymentDialog(false);
    setIsEditingPayment(false);
  };
  
  // Función para abrir el diálogo de pago
  const openPaymentDialog = () => {
    setShowNewPaymentDialog(true);
  };
  
  // Función para cerrar el diálogo de pago
  const closePaymentDialog = () => {
    setShowNewPaymentDialog(false);
  };

  return (
    <div className="space-y-6 print:p-6">
      {/* Navegación y título */}
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={() => navigate(-1)} className="print:hidden">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-semibold">
            Rendición de Cuentas - {investor?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los pagos y rendiciones de cuentas del inversionista
          </p>
        </div>
        <Button variant="outline" size="sm" className="print:hidden" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Selección del mes */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="print:hidden">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Seleccionar Mes
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 print:hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumen de vehículos */}
      <div className="space-y-4">
        {settlementData.map((item) => (
          <Card key={item.vehicle.id} className="print:shadow-none print:border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  <span>{item.vehicle.plate} - {item.vehicle.model}</span>
                </div>
                <Badge variant="secondary" className="text-base font-normal">
                  {item.totalToPay.toFixed(2)} Bs
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">
                {item.periodPayments.length} pagos registrados
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="text-sm text-muted-foreground">Total a pagar</div>
                  <div className="text-2xl font-bold">{item.totalToPay.toFixed(2)} Bs</div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="text-sm text-muted-foreground">Pagado al inversionista</div>
                  <div className="text-2xl font-bold text-green-600">{item.paidToInvestor.toFixed(2)} Bs</div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="text-sm text-muted-foreground">Pendiente</div>
                  <div className="text-2xl font-bold text-red-600">{item.pendingToPay.toFixed(2)} Bs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="print:pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumen de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="text-sm text-muted-foreground">Total a pagar</div>
              <div className="text-2xl font-bold">{totals.totalToPay.toFixed(2)} Bs</div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Pagado</p>
                  <p className={`text-2xl font-bold ${totals.paidToInvestor > 0 ? 'text-green-600' : ''}`}>
                    {totals.paidToInvestor.toFixed(2)} Bs
                  </p>
                </div>
                {latestPayment && (
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-2 print:hidden" 
                      onClick={handleEditPayment}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-2 print:hidden text-red-500" 
                      onClick={handleDeletePayment}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {latestPayment ? (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>
                    Último pago: {format(parseISO(latestPayment.date), "dd/MM/yyyy", { locale: es })}
                  </p>
                  <p>
                    Monto: {latestPayment.amount} Bs
                  </p>
                  <p>
                    Transferencia: {latestPayment.transferNumber}
                  </p>
                </div>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">
                  No se han registrado pagos para este mes.
                </div>
              )}
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="text-sm text-muted-foreground">Pendiente</div>
              <div className="text-2xl font-bold text-red-600">{totals.pendingToPay.toFixed(2)} Bs</div>
            </div>
          </div>
          <Button onClick={openPaymentDialog} className="mt-4 print:hidden">
            Registrar Pago
          </Button>
        </CardContent>
      </Card>

      {/* Diálogo de pago */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowNewPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingPayment ? "Editar Pago" : "Registrar Pago"}</DialogTitle>
            <DialogDescription>
              {isEditingPayment
                ? "Actualiza la información del pago al inversionista."
                : "Ingresa la información del pago al inversionista."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Fecha
              </Label>
              <Input
                type="date"
                id="date"
                value={paymentInfo.date}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transferNumber" className="text-right">
                Número de Transferencia
              </Label>
              <Input
                type="text"
                id="transferNumber"
                value={paymentInfo.transferNumber}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, transferNumber: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Monto (Bs)
              </Label>
              <Input
                type="number"
                id="amount"
                value={paymentInfo.amount}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, amount: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handlePaymentSubmit}>
            {isEditingPayment ? "Actualizar Pago" : "Registrar Pago"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar pago */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el pago como cancelado y no aparecerá en la rendición.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deletePayment} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvestorSettlement;
