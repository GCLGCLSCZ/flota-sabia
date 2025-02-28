
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Car, DollarSign, Printer, MessageSquare, Loader2, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useApp } from "@/context/AppContext";
import { Payment } from "@/types";

const Payments = () => {
  const { toast } = useToast();
  const [showNewPaymentDialog, setShowNewPaymentDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [bankName, setBankName] = useState("Ganadero");
  const [transferNumber, setTransferNumber] = useState("");
  const [customBank, setCustomBank] = useState("");
  const [showCustomBank, setShowCustomBank] = useState(false);
  
  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  
  // Usar el contexto de la aplicación para obtener los vehículos y pagos
  const { vehicles, payments, addPayment, removePayment, loading } = useApp();

  const generateReceiptNumber = () => {
    if (!payments.length) return "REC-001";
    
    const lastReceipt = payments
      .map(p => p.receiptNumber ? parseInt(p.receiptNumber.split('-')[1]) : 0)
      .sort((a, b) => b - a)[0] || 0;
    return `REC-${String(lastReceipt + 1).padStart(3, '0')}`;
  };

  const handleNewPayment = () => {
    if (!selectedVehicle || !amount || !concept) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "transfer" && !transferNumber) {
      toast({
        title: "Número de transferencia requerido",
        description: "Por favor ingresa el número de transferencia",
        variant: "destructive",
      });
      return;
    }

    // Crear el objeto de pago
    const paymentData: Omit<Payment, "id"> = {
      vehicleId: selectedVehicle,
      amount: parseFloat(amount),
      date: selectedDate.toISOString().split('T')[0],
      concept,
      status: "completed",
      paymentMethod,
      receiptNumber: generateReceiptNumber(),
      ...(paymentMethod === "transfer" && {
        bankName: customBank || bankName,
        transferNumber,
      }),
    };

    // Añadir el pago usando el contexto
    const success = addPayment(paymentData);

    if (success) {
      toast({
        title: "Pago registrado",
        description: `Se ha registrado un pago de $${amount} para el vehículo ${
          vehicles.find((v) => v.id === selectedVehicle)?.plate
        }. Recibo #${paymentData.receiptNumber}`,
      });

      setShowNewPaymentDialog(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedVehicle("");
    setSelectedDate(new Date());
    setAmount("");
    setConcept("");
    setPaymentMethod("cash");
    setBankName("Ganadero");
    setTransferNumber("");
    setCustomBank("");
    setShowCustomBank(false);
  };

  const handlePrintReceipt = (payment: Payment) => {
    toast({
      title: "Imprimiendo recibo",
      description: `Recibo #${payment.receiptNumber}`,
    });
  };

  const handleWhatsAppReceipt = (payment: Payment, vehicle: any) => {
    const receiptText = `*Recibo de Pago #${payment.receiptNumber}*
🚗 Vehículo: ${vehicle.plate} - ${vehicle.model}
💵 Monto: $${payment.amount}
📅 Fecha: ${format(new Date(payment.date), "dd/MM/yyyy")}
🧾 Concepto: ${payment.concept}
💳 Método de pago: ${payment.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
${payment.bankName ? `🏦 Banco: ${payment.bankName}` : ""}
${payment.transferNumber ? `🔢 N° Transferencia: ${payment.transferNumber}` : ""}`;

    const whatsappUrl = `https://wa.me/${vehicle.driverPhone}?text=${encodeURIComponent(receiptText)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Funciones para eliminar pagos
  const handleDeleteClick = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (paymentToDelete) {
      const success = await removePayment(paymentToDelete);
      
      if (success) {
        toast({
          title: "Pago eliminado",
          description: "El pago ha sido eliminado exitosamente",
        });
      }
      
      setPaymentToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "analysing":
        return "bg-blue-100 text-blue-800";
      default:
        return "";
    }
  };

  const getStatusText = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelado";
      case "analysing":
        return "En análisis";
      default:
        return "";
    }
  };

  // Determinar si un pago es a un inversionista
  const isInvestorPayment = (payment: Payment) => {
    return payment.concept.toLowerCase().includes("inversionista");
  };

  // Si está cargando, mostrar indicador de carga
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Cargando datos de pagos...</h2>
        <p className="text-muted-foreground mt-2">Por favor espera mientras se cargan los datos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de Pagos</h1>
          <p className="text-muted-foreground mt-1">
            Registra y gestiona los pagos de los vehículos
          </p>
        </div>
        <Button onClick={() => setShowNewPaymentDialog(true)}>
          <DollarSign className="mr-2 h-4 w-4" />
          Nuevo Pago
        </Button>
      </div>

      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Pagos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vehicles.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-muted-foreground">No hay vehículos registrados</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => toast({
                    title: "Información",
                    description: "Para registrar pagos, primero debes registrar vehículos"
                  })}
                >
                  <Car className="mr-2 h-4 w-4" />
                  Ir a Vehículos
                </Button>
              </div>
            ) : (
              vehicles.map((vehicle) => {
                const vehiclePayments = payments.filter(
                  (p) => p.vehicleId === vehicle.id
                );
                
                // Separar ingresos y egresos (pagos a inversores)
                const completedIncomes = vehiclePayments
                  .filter((p) => p.status === "completed" && !isInvestorPayment(p))
                  .reduce((sum, p) => sum + p.amount, 0);
                  
                const completedExpenses = vehiclePayments
                  .filter((p) => p.status === "completed" && isInvestorPayment(p))
                  .reduce((sum, p) => sum + p.amount, 0);
                  
                const pendingPayments = vehiclePayments.filter(
                  (p) => p.status === "pending"
                ).length;

                return (
                  <div
                    key={vehicle.id}
                    className="p-4 rounded-lg border space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span className="font-medium">
                        {vehicle.plate} - {vehicle.model}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Conductor: {vehicle.driverName}</p>
                      <p>Teléfono: {vehicle.driverPhone}</p>
                      <p>Tarifa diaria: ${vehicle.dailyRate}</p>
                      <div className="flex items-center text-green-600">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        <span>Ingresos: ${completedIncomes}</span>
                      </div>
                      <div className="flex items-center text-red-600">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        <span>Egresos (inversores): ${completedExpenses}</span>
                      </div>
                      <p>Pagos pendientes: {pendingPayments}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-3">No hay pagos registrados</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewPaymentDialog(true)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Registrar primer pago
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => {
                  const vehicle = vehicles.find((v) => v.id === payment.vehicleId);
                  const isToInvestor = isInvestorPayment(payment);
                  
                  return (
                    <div
                      key={payment.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isToInvestor ? "border-red-200 bg-red-50" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          <span className="font-medium">
                            {vehicle ? `${vehicle.plate} - ${vehicle.model}` : "Vehículo no encontrado"}
                          </span>
                          {isToInvestor && (
                            <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                              Pago a inversionista
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {payment.concept}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.date), "dd/MM/yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Recibo #{payment.receiptNumber} - 
                          {payment.paymentMethod === "cash" ? "Efectivo" : `Transferencia ${payment.bankName}`}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className={`font-medium ${isToInvestor ? "text-red-600" : ""}`}>
                          ${payment.amount}
                          {isToInvestor && <ArrowDown className="h-3 w-3 ml-1 inline" />}
                          {!isToInvestor && <ArrowUp className="h-3 w-3 ml-1 inline text-green-600" />}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {getStatusText(payment.status)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintReceipt(payment)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          {vehicle && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWhatsAppReceipt(payment, vehicle)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(payment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación para eliminar pago */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Realmente deseas eliminar este pago?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showNewPaymentDialog} onOpenChange={setShowNewPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vehículo</Label>
              <Select
                value={selectedVehicle}
                onValueChange={setSelectedVehicle}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>{vehicle.plate} - {vehicle.model}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: "cash" | "transfer") => setPaymentMethod(value)}
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

            {paymentMethod === "transfer" && (
              <>
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Select
                    value={showCustomBank ? "otro" : bankName}
                    onValueChange={(value) => {
                      if (value === "otro") {
                        setShowCustomBank(true);
                      } else {
                        setShowCustomBank(false);
                        setBankName(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ganadero">Banco Ganadero</SelectItem>
                      <SelectItem value="otro">Otro banco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showCustomBank && (
                  <div className="space-y-2">
                    <Label>Nombre del Banco</Label>
                    <Input
                      value={customBank}
                      onChange={(e) => {
                        setCustomBank(e.target.value);
                        setBankName(e.target.value);
                      }}
                      placeholder="Ingresa el nombre del banco"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Número de Transferencia</Label>
                  <Input
                    value={transferNumber}
                    onChange={(e) => setTransferNumber(e.target.value)}
                    placeholder="Ej: TRF123456"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Monto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Concepto</Label>
              <Input
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ej: Renta semanal"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNewPayment}>
                Registrar Pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;
