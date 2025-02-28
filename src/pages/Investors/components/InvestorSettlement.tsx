
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Printer, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useApp } from "@/context/AppContext";
import { Investor, Payment } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "./settlement-print.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const InvestorSettlement = () => {
  const { id } = useParams<{ id: string }>();
  const { investors, vehicles, payments, addPayment, updateInvestor, settings } = useApp();
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

  useEffect(() => {
    if (id) {
      const foundInvestor = investors.find((i) => i.id === id);
      if (foundInvestor) {
        setInvestor(foundInvestor);
      }
    }
  }, [id, investors]);

  useEffect(() => {
    // Establecer fechas por defecto: mes actual
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(lastDayOfMonth.toISOString().split('T')[0]);
  }, []);

  if (!investor) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Obtener la tarifa mensual de GPS
  const gpsMonthlyFee = settings?.gpsMonthlyFee || 0;
  
  // Filtrar vehículos del inversionista
  const investorVehicles = vehicles.filter(
    (vehicle) => vehicle.investor === investor.name
  );

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
      
      // Calcular días del período
      const periodDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Calcular meses completos en el período (para GPS)
      const months = periodDays / 30;
      
      // Calcular descuento de GPS para el período - SIEMPRE el monto completo mensual
      // Independientemente de si el vehículo trabajó o no
      const gpsDiscount = gpsMonthlyFee * months;
      
      // Descuentos totales
      const totalDiscounts = maintenanceDiscounts + gpsDiscount;

      // Cálculo del porcentaje del inversionista (70% por defecto si no se especifica)
      const investorPercentage = 0.7; // Asumimos 70% para el inversionista

      // Monto que corresponde al inversionista (ingresos menos descuentos)
      const investorAmount = (periodIncome - totalDiscounts) * investorPercentage;

      // Saldo por pagar al inversionista
      const balanceDue = investorAmount - periodPayments;

      return {
        vehicle,
        periodIncome,
        periodPayments,
        maintenanceDiscounts,
        gpsDiscount,
        totalDiscounts,
        investorAmount,
        balanceDue
      };
    });
  };

  const vehicleData = calculateVehicleData();

  // Calcular totales
  const totals = vehicleData.reduce(
    (acc, data) => {
      acc.income += data.periodIncome;
      acc.investorAmount += data.investorAmount;
      acc.paid += data.periodPayments;
      acc.balance += data.balanceDue;
      acc.maintenanceDiscounts += data.maintenanceDiscounts;
      acc.gpsDiscounts += data.gpsDiscount;
      acc.totalDiscounts += data.totalDiscounts;
      return acc;
    },
    { income: 0, investorAmount: 0, paid: 0, balance: 0, maintenanceDiscounts: 0, gpsDiscounts: 0, totalDiscounts: 0 }
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
              concept: `Pago a inversionista: ${investor.name} - Liquidación`,
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

      toast({
        title: "Pago registrado",
        description: `Se ha registrado un pago de Bs ${parseFloat(payAmount).toFixed(2)} al inversionista ${investor.name}`,
      });

      setShowPayDialog(false);
      setPayAmount("");
      setPaymentMethod("cash");
      setBankName("");
      setTransferNumber("");
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

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-10" id="settlement-print">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link to={`/investors`}>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="h-8 gap-1"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Imprimir
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
                      <TableCell>{data.vehicle.plate} - {data.vehicle.model}</TableCell>
                      <TableCell className="text-right">Bs {data.periodIncome.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        Bs {data.totalDiscounts.toFixed(2)}
                        <div className="text-xs text-muted-foreground">
                          Mant: Bs {data.maintenanceDiscounts.toFixed(2)} | GPS: Bs {data.gpsDiscount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">Bs {data.investorAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">Bs {data.periodPayments.toFixed(2)}</TableCell>
                      <TableCell className={`text-right ${data.balanceDue > 0 ? "text-red-500" : ""}`}>
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
                  <span className="font-medium">Ingresos totales:</span>
                  <span>Bs {totals.income.toFixed(2)}</span>
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
                    <span>Pagado hasta la fecha:</span>
                    <span>Bs {totalHistoricalPayments.toFixed(2)}</span>
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
