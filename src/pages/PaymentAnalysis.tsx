
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  ArrowDownRight, ArrowUpRight, CheckCircle, DollarSign, 
  HelpCircle, Loader2, RefreshCcw, Search, AlertTriangle,
  Trash2, ArrowDown, ArrowUp
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle, Payment } from "@/types";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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

const PaymentAnalysis = () => {
  const { payments, vehicles, updatePayment, removePayment, loading } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<Payment["status"]>("completed");
  
  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  // Determinar si un pago es a un inversionista
  const isInvestorPayment = (payment: Payment) => {
    return payment.concept.toLowerCase().includes("inversionista");
  };

  // Filtrar pagos
  const filteredPayments = payments.filter(payment => {
    const vehicle = vehicles.find(v => v.id === payment.vehicleId);
    const matchesSearch = 
      payment.concept.toLowerCase().includes(search.toLowerCase()) ||
      vehicle?.plate?.toLowerCase().includes(search.toLowerCase()) ||
      payment.transferNumber?.toLowerCase().includes(search.toLowerCase()) ||
      payment.bankName?.toLowerCase().includes(search.toLowerCase()) ||
      payment.id.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calcular estadísticas distinguiendo entre ingresos y egresos
  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === "completed").length,
    pending: payments.filter(p => p.status === "pending").length,
    analysing: payments.filter(p => p.status === "analysing").length,
    incomeAmount: payments
      .filter(p => p.status === "completed" && !isInvestorPayment(p))
      .reduce((sum, p) => sum + p.amount, 0),
    expenseAmount: payments
      .filter(p => p.status === "completed" && isInvestorPayment(p))
      .reduce((sum, p) => sum + p.amount, 0)
  };

  const handleUpdateStatus = async () => {
    if (!selectedPayment) return;
    
    setUpdating(true);
    
    try {
      await updatePayment(selectedPayment.id, { status: newStatus });
      
      toast({
        title: "Estado actualizado",
        description: `El pago se ha marcado como "${
          newStatus === "completed" ? "Completado" :
          newStatus === "pending" ? "Pendiente" :
          newStatus === "analysing" ? "En análisis" : "Cancelado"
        }"`,
      });
      
      setOpenDetailsDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pago",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
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

  const getVehicleDetails = (vehicleId: string): Vehicle | undefined => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelado</Badge>;
      case "analysing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">En análisis</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Desconocido</Badge>;
    }
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
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Análisis de Pagos</h1>
          <p className="text-muted-foreground">Analiza y verifica el estado de los pagos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">${stats.incomeAmount.toLocaleString()}</div>
              <div className="p-2 bg-green-100 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Egresos a inversionistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">${stats.expenseAmount.toLocaleString()}</div>
              <div className="p-2 bg-red-100 rounded-full">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos pendientes/análisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.pending + stats.analysing}</div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <HelpCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pagos..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="analysing">En análisis</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay pagos registrados</h3>
              <p className="text-muted-foreground mb-4">
                No se encontraron registros de pagos en el sistema.
              </p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin resultados</h3>
              <p className="text-muted-foreground mb-4">
                No se encontraron pagos que coincidan con los criterios de búsqueda.
              </p>
              <Button variant="outline" onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const vehicle = getVehicleDetails(payment.vehicleId);
                  const isToInvestor = isInvestorPayment(payment);
                  
                  return (
                    <TableRow key={payment.id} className={isToInvestor ? "bg-red-50" : ""}>
                      <TableCell>
                        {format(new Date(payment.date), "dd MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {vehicle ? `${vehicle.plate} - ${vehicle.model}` : "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {payment.concept}
                      </TableCell>
                      <TableCell>
                        {isToInvestor ? (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            <ArrowDown className="h-3 w-3 mr-1" />
                            Egreso
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            Ingreso
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={`text-right ${isToInvestor ? "text-red-600" : "text-green-600"}`}>
                        ${payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        {payment.paymentMethod === "cash" ? "Efectivo" : 
                          `Transferencia ${payment.bankName || ""} ${payment.transferNumber ? "#" + payment.transferNumber : ""}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setNewStatus(payment.status);
                              setOpenDetailsDialog(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(payment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Pago</DialogTitle>
            <DialogDescription>
              Revisa y actualiza el estado del pago
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(selectedPayment.date), "dd MMMM yyyy", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monto</p>
                  <p className={`font-medium ${isInvestorPayment(selectedPayment) ? "text-red-600" : "text-green-600"}`}>
                    ${selectedPayment.amount.toLocaleString()}
                    {isInvestorPayment(selectedPayment) ? " (Egreso)" : " (Ingreso)"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vehículo</p>
                  <p className="font-medium">
                    {(() => {
                      const vehicle = getVehicleDetails(selectedPayment.vehicleId);
                      return vehicle ? `${vehicle.plate} - ${vehicle.model}` : "N/A";
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Método de pago</p>
                  <p className="font-medium">
                    {selectedPayment.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
                    {selectedPayment.paymentMethod === "transfer" && selectedPayment.bankName && ` (${selectedPayment.bankName})`}
                  </p>
                </div>
                {selectedPayment.paymentMethod === "transfer" && selectedPayment.transferNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nº Transferencia</p>
                    <p className="font-medium">{selectedPayment.transferNumber}</p>
                  </div>
                )}
                {selectedPayment.receiptNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nº Recibo</p>
                    <p className="font-medium">{selectedPayment.receiptNumber}</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Concepto</p>
                <p className="font-medium">{selectedPayment.concept}</p>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Cambiar estado del pago</p>
                <Select
                  value={newStatus}
                  onValueChange={(value: Payment["status"]) => setNewStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        Completado
                      </div>
                    </SelectItem>
                    <SelectItem value="pending">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                        Pendiente
                      </div>
                    </SelectItem>
                    <SelectItem value="analysing">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                        En análisis
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                        Cancelado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleUpdateStatus} disabled={updating}>
                    {updating ? 
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </> : 
                      "Actualizar estado"
                    }
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default PaymentAnalysis;
