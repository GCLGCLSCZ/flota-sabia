
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Printer, DollarSign, Loader2, MessageSquare, Calendar, CreditCard } from "lucide-react";
import { format, isMonday, isSunday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useApp } from "@/context/AppContext";
import { Investor, Payment, Settlement } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "./settlement-print.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const InvestorSettlement = () => {
  const { id, settlementId } = useParams<{ id: string; settlementId: string }>();
  const navigate = useNavigate();
  const { 
    investors, 
    vehicles, 
    payments, 
    addPayment, 
    updateInvestor, 
    settings, 
    settlements,
    addSettlement,
    updateSettlement 
  } = useApp();
  const { toast } = useToast();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [bankName, setBankName] = useState("");
  const [transferNumber, setTransferNumber] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSettlement, setExistingSettlement] = useState<Settlement | null>(null);
  const [saving, setSaving] = useState(false);

  // Si es un registro nuevo, establecer fechas por defecto
  useEffect(() => {
    if (settlementId !== 'new') {
      const found = settlements.find(s => s.id === settlementId);
      if (found) {
        setExistingSettlement(found);
        setStartDate(found.startDate);
        setEndDate(found.endDate);
      }
    } else {
      // Establecer fechas por defecto: mes anterior
      const today = new Date();
      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const firstDayOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
      const lastDayOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
      
      setStartDate(firstDayOfPrevMonth.toISOString().split('T')[0]);
      setEndDate(lastDayOfPrevMonth.toISOString().split('T')[0]);
    }
  }, [settlementId, settlements]);

  useEffect(() => {
    if (id) {
      const foundInvestor = investors.find((i) => i.id === id);
      if (foundInvestor) {
        setInvestor(foundInvestor);
      }
    }
  }, [id, investors]);

  if (!investor) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Obtener la tarifa mensual de GPS
  const gpsMonthlyFee = settings?.gpsMonthlyFee || 120; // Asegurarse de usar 120 como valor por defecto
  
  // Obtener el porcentaje del inversionista (70% por defecto)
  const investorPercentage = settings?.investorPercentage || 0.7;
  
  // Filtrar vehículos del inversionista
  const investorVehicles = vehicles.filter(
    (vehicle) => vehicle.investor === investor.name && vehicle.status === "active"
  );

  // Función para contar días laborables en un rango (excluye domingos y días no trabajados)
  const countWorkingDays = (start: Date, end: Date, daysNotWorked: string[] = []) => {
    let count = 0;
    const currentDate = new Date(start);
    const daysOffDates = new Set(daysNotWorked.map(d => new Date(d).toDateString()));
    
    // Asegurarse de que las fechas estén al inicio del día para comparaciones correctas
    currentDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);
    
    // Iterar por cada día del período
    while (currentDate <= endDate) {
      // Excluir domingos y días marcados como no trabajados
      if (!isSunday(currentDate) && !daysOffDates.has(currentDate.toDateString())) {
        count++;
      }
      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  };

  // Calcular ingresos y pagos por vehículo en el período seleccionado
  const calculateVehicleData = () => {
    return investorVehicles.map((vehicle) => {
      // Pagos realizados al inversionista
      const investorPayments = payments.filter(
        (p) => 
          p.vehicleId === vehicle.id && 
          p.concept.toLowerCase().includes("inversionista") &&
          new Date(p.date) >= new Date(startDate) &&
          new Date(p.date) <= new Date(endDate)
      );

      // Pagos del vehículo (ingresos)
      const vehiclePayments = payments.filter(
        (p) => 
          p.vehicleId === vehicle.id && 
          new Date(p.date) >= new Date(startDate) &&
          new Date(p.date) <= new Date(endDate) &&
          !p.concept.toLowerCase().includes("inversionista") &&
          p.status === "completed"
      );

      // Total de ingresos en el período
      const periodIncome = vehiclePayments.reduce(
        (sum, p) => sum + p.amount, 
        0
      );

      // Total de pagos al inversionista en el período
      const periodPayments = investorPayments.reduce(
        (sum, p) => sum + p.amount, 
        0
      );

      // Calcular descuentos por mantenimiento en el período
      const maintenanceDiscounts = vehicle.maintenanceHistory 
        ? vehicle.maintenanceHistory
            .filter(m => 
              m.status === "completed" && 
              new Date(m.date) >= new Date(startDate) &&
              new Date(m.date) <= new Date(endDate)
            )
            .reduce((sum, m) => sum + m.cost, 0)
        : 0;
      
      // Calcular días LABORABLES en el período (excluyendo domingos y días no trabajados)
      const workingDays = countWorkingDays(
        new Date(startDate), 
        new Date(endDate), 
        vehicle.daysNotWorked || []
      );
      
      // Usar el GPS mensual - 1 GPS por mes
      const gpsDiscount = gpsMonthlyFee;
      
      // Valor de renta diaria
      const dailyRentAmount = vehicle.installmentAmount || 0;
      
      // Comisión diaria de la empresa
      const dailyCommission = vehicle.dailyRate || 0;
      
      // Calcular ingresos reales basados en días trabajados y tarifa diaria
      const expectedIncome = workingDays * dailyRentAmount;
      
      // Descuentos por comisión de la empresa (días trabajados * comisión diaria)
      const commissionDiscount = workingDays * dailyCommission;
      
      // Descuentos totales
      const totalDiscounts = maintenanceDiscounts + gpsDiscount + commissionDiscount;

      // Monto que corresponde al inversionista (ingresos - descuentos)
      const investorAmount = Math.max(0, (expectedIncome - totalDiscounts));

      // Saldo por pagar al inversionista
      const balanceDue = investorAmount - periodPayments;

      // Información de cuotas
      const installmentAmount = vehicle.installmentAmount || 0;
      const totalInstallments = vehicle.totalInstallments || 0;
      
      // Calcular cuotas pagadas basado en los pagos realizados
      const vehicleAllPayments = payments.filter(
        (p) => p.vehicleId === vehicle.id && !p.concept.toLowerCase().includes("inversionista") && p.status === "completed"
      );
      
      const totalPaid = vehicleAllPayments.reduce((sum, p) => sum + p.amount, 0);
      const paidInstallments = installmentAmount > 0 ? Math.floor(totalPaid / installmentAmount) : 0;
      const remainingInstallments = Math.max(0, totalInstallments - paidInstallments);
      
      // Calcular último pago
      const lastPayment = vehicleAllPayments.length > 0 
        ? vehicleAllPayments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;

      return {
        vehicleId: vehicle.id,
        vehicle,
        periodIncome,
        expectedIncome,
        periodPayments,
        maintenanceDiscounts,
        gpsDiscount,
        commissionDiscount,
        totalDiscounts,
        investorAmount,
        balanceDue,
        totalPaid,
        paidInstallments,
        remainingInstallments,
        installmentAmount,
        totalInstallments,
        lastPayment,
        workingDays,
        dailyRentAmount,
        dailyCommission
      };
    });
  };

  const vehicleData = calculateVehicleData();

  // Calcular totales
  const totals = vehicleData.reduce(
    (acc, data) => {
      acc.income += data.periodIncome;
      acc.expectedIncome += data.expectedIncome;
      acc.investorAmount += data.investorAmount;
      acc.paid += data.periodPayments;
      acc.balance += data.balanceDue;
      acc.maintenanceDiscounts += data.maintenanceDiscounts;
      acc.gpsDiscounts += data.gpsDiscount;
      acc.commissionDiscounts += data.commissionDiscount;
      acc.totalDiscounts += data.totalDiscounts;
      acc.totalPaid += data.totalPaid;
      acc.workingDays += data.workingDays;
      return acc;
    },
    { 
      income: 0, 
      expectedIncome: 0,
      investorAmount: 0, 
      paid: 0, 
      balance: 0, 
      maintenanceDiscounts: 0, 
      gpsDiscounts: 0, 
      commissionDiscounts: 0,
      totalDiscounts: 0, 
      totalPaid: 0, 
      workingDays: 0 
    }
  );

  // Calcular pagos totales históricos al inversionista
  const totalHistoricalPayments = payments
    .filter(p => 
      investorVehicles.some(v => v.id === p.vehicleId) && 
      p.concept.toLowerCase().includes("inversionista")
    )
    .reduce((sum, p) => sum + p.amount, 0);

  // Calcular ingresos totales históricos de los vehículos
  const totalHistoricalIncome = payments
    .filter(p => 
      investorVehicles.some(v => v.id === p.vehicleId) && 
      !p.concept.toLowerCase().includes("inversionista") &&
      p.status === "completed"
    )
    .reduce((sum, p) => sum + p.amount, 0);

  // Guardar o actualizar la rendición
  const saveSettlement = async () => {
    setSaving(true);
    try {
      // Preparar los datos de vehículos para guardar
      const vehiclesForSettlement = vehicleData.map(data => ({
        vehicleId: data.vehicle.id,
        workingDays: data.workingDays,
        income: data.expectedIncome,
        discounts: {
          maintenance: data.maintenanceDiscounts,
          gps: data.gpsDiscount,
          commission: data.commissionDiscount,
          total: data.totalDiscounts
        },
        investorAmount: data.investorAmount,
        paid: data.periodPayments,
        balance: data.balanceDue
      }));

      // Datos para la rendición
      const settlementData: Omit<Settlement, "id"> = {
        investorId: investor.id,
        startDate,
        endDate,
        createdAt: new Date().toISOString(),
        totalAmount: totals.investorAmount,
        paidAmount: totals.paid,
        balance: totals.balance,
        status: totals.balance <= 0 ? 'completed' : 'pending',
        vehicleData: vehiclesForSettlement
      };

      let success;
      if (existingSettlement) {
        // Actualizar rendición existente
        success = await updateSettlement(existingSettlement.id, settlementData);
      } else {
        // Crear nueva rendición
        success = await addSettlement(settlementData);
      }

      if (success) {
        toast({
          title: existingSettlement ? "Rendición actualizada" : "Rendición guardada",
          description: `La rendición ha sido ${existingSettlement ? 'actualizada' : 'guardada'} correctamente.`
        });
        
        // Redirigir al listado de rendiciones
        navigate(`/investors/${investor.id}/settlements`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la rendición",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Función para registrar un pago al inversionista
  const handlePayment = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      toast({
        title: "Error en el pago",
        description: "Debes ingresar un monto válido",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "transfer" && (!bankName || !transferNumber)) {
      toast({
        title: "Datos incompletos",
        description: "Debes completar los datos de la transferencia",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear un pago separado para cada vehículo, distribuido proporcionalmente
      const totalBalance = totals.balance;
      let remainingAmount = parseFloat(payAmount);
      
      // Solo continuamos si hay balance por pagar
      if (totalBalance <= 0) {
        toast({
          title: "No hay saldo pendiente",
          description: "No hay saldo pendiente para pagar al inversionista",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Si el monto a pagar es mayor que el saldo, limitamos al saldo
      const effectivePayAmount = Math.min(remainingAmount, totalBalance);
      
      // Registramos los pagos para cada vehículo con balance pendiente
      for (const data of vehicleData) {
        if (data.balanceDue > 0 && remainingAmount > 0) {
          // Calculamos la proporción del pago que corresponde a este vehículo
          const proportion = data.balanceDue / totalBalance;
          const vehiclePayAmount = Math.min(
            effectivePayAmount * proportion,
            data.balanceDue,
            remainingAmount
          );
          
          if (vehiclePayAmount > 0) {
            // Creamos el pago para este vehículo
            const paymentData: Omit<Payment, "id"> = {
              vehicleId: data.vehicle.id,
              amount: vehiclePayAmount,
              date: new Date().toISOString().split('T')[0],
              concept: `Pago a inversionista: ${investor.name} - Rendición de ${getPeriodMonthName()}`,
              status: "completed",
              paymentMethod,
              ...(paymentMethod === "transfer" && {
                bankName,
                transferNumber,
              }),
            };
            
            // Registrar el pago
            await addPayment(paymentData);
            
            // Actualizar el total restante
            remainingAmount -= vehiclePayAmount;
          }
        }
      }
      
      // Actualizar la fecha del último pago del inversionista
      await updateInvestor(investor.id, {
        lastPayment: new Date().toISOString().split('T')[0]
      });

      // Si es una rendición existente, actualizar su estado
      if (existingSettlement) {
        await updateSettlement(existingSettlement.id, {
          paidAmount: existingSettlement.paidAmount + parseFloat(payAmount),
          balance: Math.max(0, existingSettlement.balance - parseFloat(payAmount)),
          status: (existingSettlement.balance - parseFloat(payAmount) <= 0) ? 'completed' : 'pending'
        });
      }

      toast({
        title: "Pago registrado",
        description: `Se ha registrado un pago de Bs ${parseFloat(payAmount).toFixed(2)} al inversionista ${investor.name}`,
      });

      setShowPayDialog(false);
      setPayAmount("");
      setPaymentMethod("cash");
      setBankName("");
      setTransferNumber("");
      
      // Navegar de vuelta al listado de rendiciones
      navigate(`/investors/${investor.id}/settlements`);
    } catch (error) {
      toast({
        title: "Error al procesar el pago",
        description: "No se pudo registrar el pago. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para enviar la liquidación por WhatsApp
  const handleWhatsAppShare = () => {
    if (!investor.contact) {
      toast({
        title: "No se puede enviar",
        description: "El inversionista no tiene un número de contacto registrado",
        variant: "destructive",
      });
      return;
    }
    
    // Crear el texto de la liquidación
    const message = `*LIQUIDACIÓN DE INVERSIONISTA*
*Período:* ${format(new Date(startDate), "dd/MM/yyyy")} - ${format(new Date(endDate), "dd/MM/yyyy")}
*Inversionista:* ${investor.name}

*RESUMEN:*
Ingresos totales (esperados): Bs ${totals.expectedIncome.toFixed(2)}
Descuentos totales: Bs ${totals.totalDiscounts.toFixed(2)}
- Mantenimiento: Bs ${totals.maintenanceDiscounts.toFixed(2)}
- GPS: Bs ${totals.gpsDiscounts.toFixed(2)}
- Comisión diaria: Bs ${totals.commissionDiscounts.toFixed(2)}
Corresponde al inversionista: Bs ${totals.investorAmount.toFixed(2)}
Pagado en período: Bs ${totals.paid.toFixed(2)}
*Saldo por pagar: Bs ${totals.balance.toFixed(2)}*

*DETALLE POR VEHÍCULO:*
${vehicleData.map(data => 
  `${data.vehicle.plate} - ${data.vehicle.model}
  Días trabajados: ${data.workingDays}
  Ingresos esperados: Bs ${data.expectedIncome.toFixed(2)}
  Descuentos: Bs ${data.totalDiscounts.toFixed(2)}
   - Mantenimiento: Bs ${data.maintenanceDiscounts.toFixed(2)}
   - GPS: Bs ${data.gpsDiscount.toFixed(2)}
   - Comisión: Bs ${data.commissionDiscount.toFixed(2)}
  Corresponde: Bs ${data.investorAmount.toFixed(2)}
  Pagado: Bs ${data.periodPayments.toFixed(2)}
  Saldo: Bs ${data.balanceDue.toFixed(2)}
  
  Cuotas pagadas: ${data.paidInstallments} de ${data.totalInstallments}
  Total pagado histórico: Bs ${data.totalPaid.toFixed(2)}`
).join('\n\n')}`;

    // Crear enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${investor.contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Obtener el nombre del mes de la rendición
  const getPeriodMonthName = () => {
    if (!startDate) return "";
    const date = new Date(startDate);
    return format(date, "MMMM yyyy", { locale: es });
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-10" id="settlement-print">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link to={`/investors/${id}/settlements`}>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={handleWhatsAppShare}
          >
            <MessageSquare className="h-4 w-4" />
            Enviar por WhatsApp
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={saveSettlement}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {existingSettlement ? "Actualizar" : "Guardar"} Rendición
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="h-8 gap-1"
            onClick={() => setShowPayDialog(true)}
          >
            <DollarSign className="h-4 w-4" />
            Registrar Pago
          </Button>
        </div>
      </div>

      <div className="print:block">
        <Card className="border print:border-none print:shadow-none">
          <CardHeader className="print:pb-2">
            <CardTitle className="text-2xl print:text-3xl print:text-center">
              Liquidación de Inversionista
            </CardTitle>
            <CardDescription className="print:text-center print:text-base">
              <span className="font-medium">Rendición de {getPeriodMonthName()}</span>
              <br />
              Período: {format(new Date(startDate), "PPP", { locale: es })} - {format(new Date(endDate), "PPP", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 print:space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-1">
              <div className="space-y-2 print:space-y-0">
                <h3 className="font-semibold text-lg print:text-lg">Datos del Inversionista</h3>
                <div className="text-sm print:text-base space-y-1">
                  <p><span className="font-medium">Nombre:</span> {investor.name}</p>
                  <p><span className="font-medium">Contacto:</span> {investor.contact}</p>
                  <p><span className="font-medium">CI/NIT:</span> {investor.documentId}</p>
                  {investor.bankName && (
                    <p><span className="font-medium">Banco:</span> {investor.bankName}</p>
                  )}
                  {investor.bankAccount && (
                    <p><span className="font-medium">Nº Cuenta:</span> {investor.bankAccount}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 print:space-y-0 print:hidden">
                <h3 className="font-semibold text-lg">Rango de Fechas</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Fecha inicial</Label>
                    <Input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Fecha final</Label>
                    <Input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 print:mt-2">
              <h3 className="font-semibold text-lg mb-2 print:text-lg">Detalle por Vehículo</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehículo</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">Descuentos</TableHead>
                    <TableHead className="text-right">Corresponde</TableHead>
                    <TableHead className="text-right">Pagado</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleData.map((data) => (
                    <TableRow key={data.vehicle.id}>
                      <TableCell className="align-top">
                        <div>
                          <div className="font-medium">{data.vehicle.plate}</div>
                          <div className="text-sm text-muted-foreground">{data.vehicle.model}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Días trabajados: {data.workingDays}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Tarifa diaria: Bs {data.dailyRentAmount}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <div>
                          <div>Bs {data.expectedIncome.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <div className="flex items-center justify-end gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Cuotas: {data.paidInstallments} de {data.totalInstallments}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                              <CreditCard className="h-3 w-3" />
                              <span>Total histórico: Bs {data.totalPaid.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <div>
                          <div>Bs {data.totalDiscounts.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            <div>Mant: Bs {data.maintenanceDiscounts.toFixed(2)}</div>
                            <div>GPS: Bs {data.gpsDiscount.toFixed(2)}</div>
                            <div>Comisión: Bs {data.commissionDiscount.toFixed(2)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top">Bs {data.investorAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right align-top">Bs {data.periodPayments.toFixed(2)}</TableCell>
                      <TableCell className={`text-right align-top ${data.balanceDue > 0 ? "text-red-500" : ""}`}>
                        Bs {data.balanceDue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end mt-4">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">Ingresos esperados:</span>
                  <span>Bs {totals.expectedIncome.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">Descuentos totales:</span>
                  <span>Bs {totals.totalDiscounts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b text-xs text-muted-foreground">
                  <span>Mantenimiento:</span>
                  <span>Bs {totals.maintenanceDiscounts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b text-xs text-muted-foreground">
                  <span>GPS:</span>
                  <span>Bs {totals.gpsDiscounts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b text-xs text-muted-foreground">
                  <span>Comisión diaria:</span>
                  <span>Bs {totals.commissionDiscounts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">Corresponde al inversionista:</span>
                  <span>Bs {totals.investorAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">Pagado en período:</span>
                  <span>Bs {totals.paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b font-semibold">
                  <span>Saldo por pagar:</span>
                  <span className={totals.balance > 0 ? "text-red-500" : ""}>
                    Bs {totals.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Total histórico</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Ingresos generados:</span>
                    <span>Bs {totalHistoricalIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pagado al inversionista:</span>
                    <span>Bs {totalHistoricalPayments.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total pagado por vehículos:</span>
                    <span>Bs {totals.totalPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total días trabajados:</span>
                    <span>{totals.workingDays}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="print:mt-10 print:text-center print:text-sm">
              <p className="mt-8 print:block">____________________________</p>
              <p className="print:block">Firma Inversionista</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de pago */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago al Inversionista</DialogTitle>
            <DialogDescription>
              Completa los detalles del pago a {investor.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Monto a pagar</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Saldo pendiente: Bs {totals.balance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Método de pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: "cash" | "transfer") => {
                  setPaymentMethod(value);
                  setShowBankDetails(value === "transfer");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showBankDetails && (
              <>
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Input
                    placeholder="Nombre del banco"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nº Transferencia</Label>
                  <Input
                    placeholder="Número de referencia"
                    value={transferNumber}
                    onChange={(e) => setTransferNumber(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end mt-4">
              <Button onClick={handlePayment} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Registrar Pago"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestorSettlement;
