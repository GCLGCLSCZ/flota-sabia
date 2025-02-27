
import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { format, parse, parseISO, startOfMonth, endOfMonth, isSunday, subMonths, isWithinInterval, isAfter, isBefore, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calendar, Car, FileText, Printer, Wifi, AlertTriangle, InfoIcon, Wrench, CheckCircle, Edit } from "lucide-react";
import { Vehicle, Investor, Discount, Maintenance, CardexItem, Payment } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import "./settlement-print.css";

const InvestorSettlement = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { investors, vehicles, payments, settings, addPayment, updatePayment } = useApp();
  const { toast } = useToast();
  
  // Estado para la funcionalidad de pago
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
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
  
  // Primero definimos selectedMonth antes de usarlo
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const lastMonth = subMonths(new Date(), 1);
    return format(lastMonth, "yyyy-MM");
  });
  
  // Establecer el título del documento para impresión
  useEffect(() => {
    const originalTitle = document.title;
    const investor = investors.find(inv => inv.id === id);
    if (investor) {
      document.title = `Rendición - ${investor.name} - ${format(parse(selectedMonth, "yyyy-MM", new Date()), "MMMM yyyy", { locale: es })}`;
    }
    
    return () => {
      document.title = originalTitle;
    };
  }, [id, investors, selectedMonth]);
  
  // Encontrar el inversionista actual
  const investor = useMemo(() => {
    return investors.find(inv => inv.id === id);
  }, [investors, id]);
  
  // Vehículos del inversionista
  const investorVehicles = useMemo(() => {
    if (!investor) return [];
    return vehicles.filter(v => v.investor === investor.name);
  }, [investor, vehicles]);
  
  // Función para calcular los días trabajados en el mes seleccionado (excluyendo domingos y días no trabajados)
  const calculateWorkingDays = (vehicle: Vehicle, monthStr: string) => {
    // Parsear el mes seleccionado
    const selectedDate = parse(monthStr, "yyyy-MM", new Date());
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    
    // Si el vehículo aún no tenía contrato en ese mes, retornar 0
    if (vehicle.contractStartDate && parseISO(vehicle.contractStartDate) > monthEnd) {
      return 0;
    }
    
    // Obtener días no trabajados específicos para este vehículo
    const nonWorkingDays = vehicle.daysNotWorked || [];
    const nonWorkingDatesSet = new Set(nonWorkingDays.map(day => day.split('T')[0]));
    
    // Calcular días hábiles en el mes (excluyendo domingos y días no trabajados)
    let workingDaysCount = 0;
    let currentDate = new Date(monthStart);
    
    while (currentDate <= monthEnd) {
      // Convertir la fecha actual a formato YYYY-MM-DD para comparar con daysNotWorked
      const currentDateStr = currentDate.toISOString().split('T')[0];
      
      // Si no es domingo y no está en la lista de días no trabajados
      if (!isSunday(currentDate) && !nonWorkingDatesSet.has(currentDateStr)) {
        // Si la fecha de inicio del contrato es después de la fecha actual, no contar
        if (!vehicle.contractStartDate || parseISO(vehicle.contractStartDate) <= currentDate) {
          workingDaysCount++;
        }
      }
      
      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDaysCount;
  };
  
  // Obtener los últimos 12 meses para el selector
  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const month = subMonths(now, i);
      result.push({
        value: format(month, "yyyy-MM"),
        label: format(month, "MMMM yyyy", { locale: es }),
      });
    }
    
    return result;
  }, []);
  
  // Verificar si un descuento aplica al mes seleccionado
  const discountAppliesForMonth = (discount: Discount, monthStr: string) => {
    const selectedMonthDate = parse(monthStr, "yyyy-MM", new Date());
    
    // Si el descuento especifica directamente el mes
    if (discount.applyToMonths.includes(monthStr)) {
      return true;
    }
    
    // Para descuentos recurrentes, verificar si aplica según la frecuencia
    if (discount.recurring && discount.applyToMonths.length > 0) {
      const startMonth = parse(discount.applyToMonths[0], "yyyy-MM", new Date());
      
      // Si el mes seleccionado es anterior al mes inicial del descuento, no aplica
      if (isBefore(selectedMonthDate, startMonth)) {
        return false;
      }
      
      // Si es el mismo mes, aplica
      if (isSameMonth(selectedMonthDate, startMonth)) {
        return true;
      }
      
      // Verificar según la frecuencia
      switch (discount.frequency) {
        case "monthly":
          // Aplica todos los meses después del mes inicial
          return true;
        case "quarterly":
          // Verificar si han pasado múltiplos de 3 meses
          const quarterDiff = (selectedMonthDate.getFullYear() - startMonth.getFullYear()) * 12 + 
                            selectedMonthDate.getMonth() - startMonth.getMonth();
          return quarterDiff % 3 === 0;
        case "biannual":
          // Verificar si han pasado múltiplos de 6 meses
          const biannualDiff = (selectedMonthDate.getFullYear() - startMonth.getFullYear()) * 12 + 
                             selectedMonthDate.getMonth() - startMonth.getMonth();
          return biannualDiff % 6 === 0;
        case "annual":
          // Verificar si han pasado múltiplos de 12 meses
          const annualDiff = (selectedMonthDate.getFullYear() - startMonth.getFullYear()) * 12 + 
                           selectedMonthDate.getMonth() - startMonth.getMonth();
          return annualDiff % 12 === 0;
        default:
          return false;
      }
    }
    
    return false;
  };
  
  // Filtrar mantenimientos y cardex para el mes seleccionado
  const getMaintenanceForMonth = (vehicle: Vehicle, monthStr: string) => {
    if (!vehicle.maintenanceHistory) return [];
    
    const selectedMonthDate = parse(monthStr, "yyyy-MM", new Date());
    const monthStart = startOfMonth(selectedMonthDate);
    const monthEnd = endOfMonth(selectedMonthDate);
    
    return vehicle.maintenanceHistory.filter(maintenance => {
      const maintenanceDate = parseISO(maintenance.date);
      return isWithinInterval(maintenanceDate, { start: monthStart, end: monthEnd });
    });
  };
  
  const getCardexItemsForMonth = (vehicle: Vehicle, monthStr: string) => {
    if (!vehicle.cardex) return [];
    
    const selectedMonthDate = parse(monthStr, "yyyy-MM", new Date());
    const monthStart = startOfMonth(selectedMonthDate);
    const monthEnd = endOfMonth(selectedMonthDate);
    
    return vehicle.cardex.filter(item => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, { start: monthStart, end: monthEnd });
    });
  };

  // Calcular las cuotas pagadas hasta el mes seleccionado
  const calculatePaidInstallments = (vehicle: Vehicle, monthStr: string) => {
    const selectedMonthDate = parse(monthStr, "yyyy-MM", new Date());
    const monthEnd = endOfMonth(selectedMonthDate);
    
    // Filtrar pagos hasta el final del mes seleccionado
    const paidUntilMonth = payments
      .filter(p => 
        p.vehicleId === vehicle.id && 
        p.status === "completed" && 
        parseISO(p.date) <= monthEnd
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calcular cuotas pagadas
    return vehicle.installmentAmount ? 
      Math.floor(paidUntilMonth / vehicle.installmentAmount) : 
      vehicle.paidInstallments || 0;
  };
  
  // Calcular la rendición de cuentas para el mes seleccionado
  const settlementData = useMemo(() => {
    // Añadido forceUpdate para que el memo se ejecute cuando cambie
    console.log("Recalculando settlement data, forceUpdate:", forceUpdate);
    
    if (!investorVehicles.length) return [];
    
    // Usar el valor de configuración para el costo de GPS
    const gpsMonthlyFee = settings?.gpsMonthlyFee || 120;
    
    return investorVehicles.map(vehicle => {
      // Obtener los días trabajados en el mes
      const workingDays = calculateWorkingDays(vehicle, selectedMonth);
      
      // Calcular ingresos y gastos
      const dailyRate = vehicle.installmentAmount || 0; // Cuota diaria que paga el conductor
      const adminFee = vehicle.dailyRate || 0; // Comisión diaria de la empresa
      
      const totalGenerated = workingDays * dailyRate;
      const adminTotal = workingDays * adminFee;
      const netAmountBeforeGps = totalGenerated - adminTotal;
      
      // Aplicar descuento de GPS
      const netAmountBeforeDiscounts = netAmountBeforeGps - gpsMonthlyFee;
      
      // Aplicar descuentos individuales
      const applicableDiscounts = (vehicle.discounts || [])
        .filter(discount => discountAppliesForMonth(discount, selectedMonth));
      
      const totalDiscounts = applicableDiscounts.reduce((sum, discount) => sum + discount.amount, 0);
      
      // Obtener mantenimientos y cardex del mes
      const maintenanceItems = getMaintenanceForMonth(vehicle, selectedMonth);
      const cardexItems = getCardexItemsForMonth(vehicle, selectedMonth);
      
      // Total de costos de mantenimiento en el mes (USANDO EL PRECIO DE VENTA EN LUGAR DEL COSTO)
      const maintenanceCosts = maintenanceItems.reduce((sum, item) => sum + item.salePrice, 0);
      
      // Total de costos de cardex en el mes
      const cardexCosts = cardexItems.reduce((sum, item) => sum + item.cost, 0);
      
      // Monto final después de todos los descuentos
      const netAmount = netAmountBeforeDiscounts - totalDiscounts - maintenanceCosts - cardexCosts;
      
      // Verificar si hay pagos ya realizados al inversionista en este período
      const selectedMonthDate = parse(selectedMonth, "yyyy-MM", new Date());
      const monthStart = startOfMonth(selectedMonthDate);
      const monthEnd = endOfMonth(selectedMonthDate);
      
      // Filtrar pagos que corresponden a este período
      const periodPayments = payments
        .filter(p => 
          p.status === "completed" && 
          (p.concept.includes(`inversionista: ${investor?.name}`) || 
           (p.concept.includes(vehicle.plate) && p.concept.toLowerCase().includes("inversionista"))) &&
          isWithinInterval(parseISO(p.date), { start: monthStart, end: monthEnd })
        );
      
      console.log("Period payments for vehicle", vehicle.plate, ":", periodPayments);
      
      const paidToInvestor = periodPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Calcular cuotas pagadas y restantes
      const paidInstallments = calculatePaidInstallments(vehicle, selectedMonth);
      const remainingInstallments = (vehicle.totalInstallments || 0) - paidInstallments;
      
      // Monto total pagado acumulado hasta el mes actual
      const totalPaid = payments
        .filter(p => 
          p.vehicleId === vehicle.id && 
          p.status === "completed" && 
          parseISO(p.date) <= monthEnd
        )
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        model: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
        workingDays,
        dailyRate,
        totalGenerated,
        adminFee,
        adminTotal,
        gpsFee: gpsMonthlyFee,
        netAmountBeforeGps,
        discounts: applicableDiscounts,
        totalDiscounts,
        maintenance: maintenanceItems,
        maintenanceCosts,
        cardexItems,
        cardexCosts,
        netAmount,
        paidToInvestor,
        periodPayments,
        pendingAmount: netAmount - paidToInvestor,
        status: paidToInvestor >= netAmount ? "pagado" : "pendiente",
        // Información contractual adicional
        paidInstallments,
        remainingInstallments,
        totalPaid,
        contractTotalAmount: (vehicle.installmentAmount || 0) * (vehicle.totalInstallments || 0),
      };
    });
  }, [investorVehicles, selectedMonth, payments, settings, forceUpdate, investor?.name]);
  
  // Calcular totales
  const totals = useMemo(() => {
    return settlementData.reduce((acc, item) => {
      return {
        totalGenerated: acc.totalGenerated + item.totalGenerated,
        adminTotal: acc.adminTotal + item.adminTotal,
        gpsFeeTotal: acc.gpsFeeTotal + item.gpsFee,
        netAmountBeforeGps: acc.netAmountBeforeGps + item.netAmountBeforeGps,
        totalDiscounts: acc.totalDiscounts + item.totalDiscounts,
        maintenanceCosts: acc.maintenanceCosts + item.maintenanceCosts,
        cardexCosts: acc.cardexCosts + item.cardexCosts,
        netAmount: acc.netAmount + item.netAmount,
        paidToInvestor: acc.paidToInvestor + item.paidToInvestor,
        pendingAmount: acc.pendingAmount + item.pendingAmount,
        // Totales de información contractual
        totalPaid: acc.totalPaid + item.totalPaid,
        contractTotalAmount: acc.contractTotalAmount + item.contractTotalAmount
      };
    }, { 
      totalGenerated: 0, 
      adminTotal: 0,
      gpsFeeTotal: 0,
      netAmountBeforeGps: 0,
      totalDiscounts: 0,
      maintenanceCosts: 0,
      cardexCosts: 0,
      netAmount: 0,
      paidToInvestor: 0,
      pendingAmount: 0,
      // Totales de información contractual
      totalPaid: 0,
      contractTotalAmount: 0
    });
  }, [settlementData]);
  
  // Buscar el último pago realizado en este período
  const latestPayment = useMemo(() => {
    if (recentPaymentId) {
      // Buscar el pago específico que acabamos de registrar o editar
      return payments.find(p => p.id === recentPaymentId);
    } else {
      // Buscar pagos recientes para este período
      const selectedMonthDate = parse(selectedMonth, "yyyy-MM", new Date());
      const monthStart = startOfMonth(selectedMonthDate);
      const monthEnd = endOfMonth(selectedMonthDate);
      
      // Encontrar el pago más reciente
      return payments
        .filter(p => 
          p.status === "completed" && 
          p.concept.toLowerCase().includes(`rendición`) &&
          p.concept.toLowerCase().includes(format(monthStart, "MMMM yyyy", { locale: es }).toLowerCase()) &&
          isWithinInterval(parseISO(p.date), { start: monthStart, end: new Date() })
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }
  }, [payments, selectedMonth, recentPaymentId]);
  
  // Manejar la impresión de la rendición
  const handlePrint = () => {
    window.print();
  };
  
  // Iniciar edición de un pago existente
  const handleEditPayment = () => {
    if (!latestPayment) return;
    
    setPaymentInfo({
      id: latestPayment.id,
      date: latestPayment.date,
      transferNumber: latestPayment.transferNumber || "",
      amount: latestPayment.amount
    });
    
    setIsEditingPayment(true);
    setShowPaymentDialog(true);
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
      const newPayment: Omit<Payment, "id"> = {
        date: paymentInfo.date,
        amount: paymentInfo.amount || totals.netAmount,
        concept: `Pago a inversionista: ${investor.name} - Rendición ${monthLabel}`,
        paymentMethod: "transfer",
        status: "completed",
        vehicleId: settlementData[0]?.vehicleId || "",
        bankName: investor.bankName || "",
        transferNumber: paymentInfo.transferNumber
      };
      
      const success = addPayment(newPayment);
      
      if (success) {
        // Buscar el ID del pago recién agregado
        setTimeout(() => {
          const newlyAddedPayment = payments
            .filter(p => 
              p.concept === newPayment.concept && 
              p.transferNumber === newPayment.transferNumber
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          if (newlyAddedPayment) {
            setRecentPaymentId(newlyAddedPayment.id);
          }
          
          setPaymentRegistered(true);
          toast({
            title: "Pago registrado",
            description: "El pago ha sido registrado exitosamente"
          });
          
          // Forzar la actualización de los cálculos
          setForceUpdate(prev => prev + 1);
        }, 100);
      }
    }
    
    setShowPaymentDialog(false);
    setIsEditingPayment(false);
  };
  
  // Abrir diálogo para registrar un pago
  const openPaymentDialog = () => {
    setPaymentInfo({
      id: "",
      date: format(new Date(), "yyyy-MM-dd"),
      transferNumber: "",
      amount: totals.pendingAmount > 0 ? totals.pendingAmount : totals.netAmount
    });
    setIsEditingPayment(false);
    setShowPaymentDialog(true);
  };
  
  if (!investor) {
    return (
      <div className="p-6 text-center">
        <p>Inversionista no encontrado.</p>
        <Button className="mt-4" onClick={() => navigate("/investors")}>
          Volver a Inversionistas
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 print:p-6">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={() => navigate("/investors")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Inversionistas
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Rendición
          </Button>
          
          {totals.pendingAmount > 0 && !paymentRegistered && (
            <Button onClick={openPaymentDialog} variant="default">
              <CheckCircle className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
          )}
        </div>
      </div>
      
      <div className="print:flex print:justify-between print:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Rendición de Cuentas</h1>
          <p className="text-muted-foreground">
            Inversionista: <span className="font-medium">{investor.name}</span>
          </p>
        </div>
        
        <div className="mt-4 print:mt-0 print:text-right">
          <div className="print:hidden">
            <label className="text-sm font-medium block mb-2">Período</label>
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="hidden print:block">
            <p className="text-lg font-medium">
              Período: {format(parse(selectedMonth, "yyyy-MM", new Date()), "MMMM yyyy", { locale: es })}
            </p>
            <p className="text-sm text-muted-foreground">
              Fecha de emisión: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
        </div>
      </div>
      
      {/* Detalles del Contrato */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="print:pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumen Contractual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">Monto Total Contrato</p>
              <p className="text-lg font-bold">{totals.contractTotalAmount.toFixed(2)} Bs</p>
            </div>
            <div className="p-3 border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">Total Pagado Hasta la Fecha</p>
              <p className="text-lg font-bold">{totals.totalPaid.toFixed(2)} Bs</p>
            </div>
            <div className="p-3 border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">Saldo Pendiente Total</p>
              <p className="text-lg font-bold">{(totals.contractTotalAmount - totals.totalPaid).toFixed(2)} Bs</p>
            </div>
            <div className="p-3 border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">Porcentaje Completado</p>
              <p className="text-lg font-bold">
                {totals.contractTotalAmount > 0 
                  ? Math.round((totals.totalPaid / totals.contractTotalAmount) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
          
          {/* Tabla de Resumen por Vehículo */}
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead className="text-right">Total Cuotas</TableHead>
                  <TableHead className="text-right">Cuotas Pagadas</TableHead>
                  <TableHead className="text-right">Cuotas Restantes</TableHead>
                  <TableHead className="text-right">Total Pagado</TableHead>
                  <TableHead className="text-right">Saldo Pendiente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlementData.map((item) => (
                  <TableRow key={`contract-${item.vehicleId}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <div>
                          <div>{item.plate}</div>
                          <div className="text-xs text-muted-foreground">{item.model}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{Math.round(item.contractTotalAmount / item.dailyRate)}</TableCell>
                    <TableCell className="text-right">{item.paidInstallments}</TableCell>
                    <TableCell className="text-right">{item.remainingInstallments}</TableCell>
                    <TableCell className="text-right">{item.totalPaid.toFixed(2)} Bs</TableCell>
                    <TableCell className="text-right">{(item.contractTotalAmount - item.totalPaid).toFixed(2)} Bs</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="print:pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalle de Rendición por Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settlementData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead className="text-right">Días Trabajados</TableHead>
                  <TableHead className="text-right">Cuota Diaria</TableHead>
                  <TableHead className="text-right">Total Generado</TableHead>
                  <TableHead className="text-right">Comisión Adm.</TableHead>
                  <TableHead className="text-right">Total Comisión</TableHead>
                  <TableHead className="text-right">Costo GPS</TableHead>
                  <TableHead className="text-right">Descuentos</TableHead>
                  <TableHead className="text-right">Monto Neto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlementData.map((item) => (
                  <TableRow key={item.vehicleId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <div>
                          <div>{item.plate}</div>
                          <div className="text-xs text-muted-foreground">{item.model}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.workingDays}</TableCell>
                    <TableCell className="text-right">{item.dailyRate} Bs</TableCell>
                    <TableCell className="text-right">{item.totalGenerated.toFixed(2)} Bs</TableCell>
                    <TableCell className="text-right">{item.adminFee} Bs</TableCell>
                    <TableCell className="text-right">{item.adminTotal.toFixed(2)} Bs</TableCell>
                    <TableCell className="text-right text-orange-600">{item.gpsFee.toFixed(2)} Bs</TableCell>
                    <TableCell className="text-right text-orange-600">
                      {(item.totalDiscounts + item.maintenanceCosts + item.cardexCosts) > 0 
                        ? `${(item.totalDiscounts + item.maintenanceCosts + item.cardexCosts).toFixed(2)} Bs` 
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">{item.netAmount.toFixed(2)} Bs</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={3} className="font-bold">TOTALES</TableCell>
                  <TableCell className="text-right font-bold">{totals.totalGenerated.toFixed(2)} Bs</TableCell>
                  <TableCell className="text-right"></TableCell>
                  <TableCell className="text-right font-bold">{totals.adminTotal.toFixed(2)} Bs</TableCell>
                  <TableCell className="text-right font-bold text-orange-600">{totals.gpsFeeTotal.toFixed(2)} Bs</TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    {(totals.totalDiscounts + totals.maintenanceCosts + totals.cardexCosts).toFixed(2)} Bs
                  </TableCell>
                  <TableCell className="text-right font-bold">{totals.netAmount.toFixed(2)} Bs</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No hay vehículos registrados para este inversionista en el período seleccionado.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Detalles de mantenimiento */}
      {settlementData.some(item => (item.maintenance && item.maintenance.length > 0) || (item.cardexItems && item.cardexItems.length > 0)) && (
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="print:pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-500" />
              Detalle de Mantenimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Precio de Venta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mantenimientos regulares */}
                {settlementData.map((item) => (
                  item.maintenance && item.maintenance.map((maintenance) => (
                    <TableRow key={`maintenance-${item.vehicleId}-${maintenance.id}`}>
                      <TableCell className="font-medium">{item.plate}</TableCell>
                      <TableCell>
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                          Mantenimiento
                        </span>
                      </TableCell>
                      <TableCell>{maintenance.description}</TableCell>
                      <TableCell>{format(new Date(maintenance.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-right">{maintenance.cost.toFixed(2)} Bs</TableCell>
                      <TableCell className="text-right text-orange-600">{maintenance.salePrice.toFixed(2)} Bs</TableCell>
                    </TableRow>
                  ))
                ))}
                
                {/* Items de cardex */}
                {settlementData.map((item) => (
                  item.cardexItems && item.cardexItems.map((cardexItem) => (
                    <TableRow key={`cardex-${item.vehicleId}-${cardexItem.id}`}>
                      <TableCell className="font-medium">{item.plate}</TableCell>
                      <TableCell>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {cardexItem.type === "oil_change" ? "Cambio de Aceite" :
                           cardexItem.type === "filter_change" ? "Cambio de Filtros" :
                           cardexItem.type === "spark_plugs" ? "Bujías" :
                           cardexItem.type === "battery" ? "Batería" : "Otro"}
                        </span>
                      </TableCell>
                      <TableCell>{cardexItem.description}</TableCell>
                      <TableCell>{format(new Date(cardexItem.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-right text-orange-600">{cardexItem.cost.toFixed(2)} Bs</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                  ))
                ))}
                
                {/* Fila de totales */}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={5} className="font-bold">TOTAL MANTENIMIENTOS (Aplicado a rendición)</TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    {(totals.maintenanceCosts + totals.cardexCosts).toFixed(2)} Bs
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Detalles de los descuentos */}
      {settlementData.some(item => item.discounts && item.discounts.length > 0) && (
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="print:pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Detalle de Descuentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlementData.map((item) => (
                  item.discounts && item.discounts.map((discount) => (
                    <TableRow key={`${item.vehicleId}-${discount.id}`}>
                      <TableCell className="font-medium">{item.plate}</TableCell>
                      <TableCell>{discount.description}</TableCell>
                      <TableCell>
                        {discount.type === "insurance" ? "Seguro" :
                         discount.type === "repair" ? "Reparación" :
                         discount.type === "maintenance" ? "Mantenimiento" : "Otro"}
                      </TableCell>
                      <TableCell>{format(new Date(discount.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-right text-orange-600">{discount.amount.toFixed(2)} Bs</TableCell>
                    </TableRow>
                  ))
                ))}
                
                {/* Fila de totales */}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-bold">TOTAL DESCUENTOS</TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    {totals.totalDiscounts.toFixed(2)} Bs
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
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
              <p className="text-sm text-muted-foreground">Total a pagar</p>
              <p className="text-2xl font-bold">{totals.netAmount.toFixed(2)} Bs</p>
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal antes de GPS:</span>
                  <span>{totals.netAmountBeforeGps.toFixed(2)} Bs</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Descuento GPS:</span>
                  <span>-{totals.gpsFeeTotal.toFixed(2)} Bs</span>
                </div>
                {totals.totalDiscounts > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Descuentos:</span>
                    <span>-{totals.totalDiscounts.toFixed(2)} Bs</span>
                  </div>
                )}
                {(totals.maintenanceCosts + totals.cardexCosts) > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Mantenimientos:</span>
                    <span>-{(totals.maintenanceCosts + totals.cardexCosts).toFixed(2)} Bs</span>
                  </div>
                )}
              </div>
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="px-2 print:hidden" 
                    onClick={handleEditPayment}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Si existe un pago registrado para este período, mostrar detalles */}
              {latestPayment && (
                <div className="mt-2 text-xs">
                  <p className="font-medium">Detalles del Pago:</p>
                  <div className="mt-1 space-y-0.5">
                    <p>Fecha: {format(new Date(latestPayment.date), "dd/MM/yyyy")}</p>
                    {latestPayment.transferNumber && <p>Transferencia: {latestPayment.transferNumber}</p>}
                    {latestPayment.bankName && <p>Banco: {latestPayment.bankName}</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Pendiente</p>
              <p className={`text-2xl font-bold ${totals.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totals.pendingAmount.toFixed(2)} Bs
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-base font-medium mb-2">Nota:</h3>
            <p className="text-sm text-muted-foreground">
              Esta rendición corresponde al período del{" "}
              {format(startOfMonth(parse(selectedMonth, "yyyy-MM", new Date())), "dd 'de' MMMM", { locale: es })} al{" "}
              {format(endOfMonth(parse(selectedMonth, "yyyy-MM", new Date())), "dd 'de' MMMM 'de' yyyy", { locale: es })}.
              El pago debe realizarse entre el 10 y 20 del mes siguiente al período reportado.
            </p>
            <div className="flex gap-1 mt-2 text-sm text-muted-foreground items-center">
              <Wifi className="h-4 w-4 text-orange-600" />
              <span>Se ha aplicado un descuento de {settings?.gpsMonthlyFee || 120} Bs por servicio de GPS a cada vehículo.</span>
            </div>
            {(totals.totalDiscounts + totals.maintenanceCosts + totals.cardexCosts) > 0 && (
              <div className="flex gap-1 mt-1 text-sm text-muted-foreground items-center">
                <InfoIcon className="h-4 w-4 text-orange-600" />
                <span>
                  Se han aplicado descuentos adicionales y costos de mantenimiento por un total de{" "}
                  {(totals.totalDiscounts + totals.maintenanceCosts + totals.cardexCosts).toFixed(2)} Bs 
                  (detalles en las tablas de descuentos y mantenimientos).
                </span>
              </div>
            )}
          </div>
          
          {/* Datos del inversor */}
          <div className="mt-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="text-base font-medium mb-2">Datos del Inversor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm"><span className="font-medium">Nombre:</span> {investor.name}</p>
                <p className="text-sm"><span className="font-medium">Contacto:</span> {investor.contact}</p>
                <p className="text-sm"><span className="font-medium">Documento:</span> {investor.documentId}</p>
              </div>
              <div>
                {investor.bankName && (
                  <p className="text-sm"><span className="font-medium">Banco:</span> {investor.bankName}</p>
                )}
                {investor.bankAccount && (
                  <p className="text-sm"><span className="font-medium">Cuenta:</span> {investor.bankAccount}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 print:block hidden">
            <div className="grid grid-cols-2 gap-16">
              <div className="text-center">
                <div className="border-t pt-4 mt-16">
                  <p className="font-medium">Firma del Administrador</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t pt-4 mt-16">
                  <p className="font-medium">Firma del Inversionista</p>
                  <p className="text-sm text-muted-foreground mt-1">{investor.name}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Registro o Edición de Pago */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditingPayment ? "Editar Pago al Inversionista" : "Registrar Pago al Inversionista"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-date" className="text-right">
                Fecha
              </Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentInfo.date}
                onChange={(e) => setPaymentInfo({...paymentInfo, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transfer-number" className="text-right">
                N° Transferencia
              </Label>
              <Input
                id="transfer-number"
                value={paymentInfo.transferNumber}
                onChange={(e) => setPaymentInfo({...paymentInfo, transferNumber: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Monto (Bs)
              </Label>
              <Input
                id="amount"
                type="number"
                value={paymentInfo.amount}
                onChange={(e) => setPaymentInfo({...paymentInfo, amount: parseFloat(e.target.value)})}
                className="col-span-3"
              />
            </div>
            
            <div className="bg-muted/20 p-2 rounded mt-2">
              <h4 className="text-sm font-medium mb-1">Datos Bancarios del Inversor</h4>
              {investor.bankName ? (
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Banco:</span> {investor.bankName}</p>
                  {investor.bankAccount && (
                    <p><span className="font-medium">Cuenta:</span> {investor.bankAccount}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay datos bancarios registrados</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPaymentDialog(false);
              setIsEditingPayment(false);
            }}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handlePaymentSubmit}>
              {isEditingPayment ? "Actualizar Pago" : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestorSettlement;
