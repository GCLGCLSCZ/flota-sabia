
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Vehicle, Payment } from "@/types";
import "./settlement-print.css";
import { useToast } from "@/hooks/use-toast";

const InvestorSettlement = () => {
  const { investorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { investors, vehicles, payments } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [investor, setInvestor] = useState(null);
  const [investorVehicles, setInvestorVehicles] = useState<Vehicle[]>([]);
  const [investorPayments, setInvestorPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (investors.length > 0 && vehicles.length > 0 && payments.length > 0) {
      const currentInvestor = investors.find(i => i.id === investorId);
      if (!currentInvestor) {
        toast({
          title: "Inversionista no encontrado",
          description: "No se pudo encontrar información para este inversionista",
          variant: "destructive",
        });
        navigate("/investors");
        return;
      }

      setInvestor(currentInvestor);
      
      // Obtener los vehículos de este inversionista
      const investorVehicles = vehicles.filter(v => 
        v.investor === currentInvestor.name || 
        v.investor === investorId
      );
      setInvestorVehicles(investorVehicles);
      
      // Obtener los pagos relacionados con los vehículos de este inversionista
      const vehicleIds = investorVehicles.map(v => v.id);
      const relevantPayments = payments.filter(p => 
        vehicleIds.includes(p.vehicleId) &&
        p.concept && p.concept.toLowerCase().includes("inversionista")
      );
      setInvestorPayments(relevantPayments);
      
      setIsLoading(false);
    }
  }, [investors, vehicles, payments, investorId, navigate, toast]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', { 
      style: 'currency', 
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Inversionista no encontrado</h2>
        <p className="text-muted-foreground mb-4">No pudimos encontrar los datos de este inversionista.</p>
        <Button onClick={() => navigate("/investors")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Inversionistas
        </Button>
      </div>
    );
  }

  // Calcular totales
  const totalVehicles = investorVehicles.length;
  const totalPaid = investorPayments.reduce((sum, p) => sum + p.amount, 0);
  const activeVehicles = investorVehicles.filter(v => v.status === "active").length;
  const currentDate = new Date();

  return (
    <div className="space-y-6 p-2 md:p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => navigate("/investors")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>
      
      <Card className="border dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl dark:text-white">Rendición de Cuentas</CardTitle>
              <CardDescription className="dark:text-gray-400">
                {format(currentDate, "dd/MM/yyyy")}
              </CardDescription>
            </div>
            <div className="print:hidden">
              <img src="/placeholder.svg" alt="Logo" className="h-12 w-auto" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="font-medium dark:text-white">Información del Inversionista</h3>
              <p className="text-sm dark:text-gray-300"><strong>Nombre:</strong> {investor.name}</p>
              <p className="text-sm dark:text-gray-300"><strong>Contacto:</strong> {investor.contact}</p>
              <p className="text-sm dark:text-gray-300"><strong>Documento:</strong> {investor.documentId}</p>
              {investor.bankName && (
                <p className="text-sm dark:text-gray-300"><strong>Banco:</strong> {investor.bankName}</p>
              )}
              {investor.bankAccount && (
                <p className="text-sm dark:text-gray-300"><strong>Cuenta:</strong> {investor.bankAccount}</p>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-medium dark:text-white">Resumen</h3>
              <p className="text-sm dark:text-gray-300"><strong>Vehículos totales:</strong> {totalVehicles}</p>
              <p className="text-sm dark:text-gray-300"><strong>Vehículos activos:</strong> {activeVehicles}</p>
              <p className="text-sm dark:text-gray-300"><strong>Total pagado:</strong> {formatCurrency(totalPaid)}</p>
              <p className="text-sm dark:text-gray-300"><strong>Último pago:</strong> {investor.lastPayment ? format(new Date(investor.lastPayment), "dd/MM/yyyy") : "Sin pagos"}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 dark:text-white">Vehículos</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-400">Placa</TableHead>
                    <TableHead className="dark:text-gray-400">Modelo</TableHead>
                    <TableHead className="dark:text-gray-400">Estado</TableHead>
                    <TableHead className="dark:text-gray-400">Conductor</TableHead>
                    <TableHead className="dark:text-gray-400">Cuotas</TableHead>
                    <TableHead className="dark:text-gray-400">Ingreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investorVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="dark:border-gray-700">
                      <TableCell className="font-medium dark:text-white">{vehicle.plate}</TableCell>
                      <TableCell className="dark:text-gray-300">{vehicle.brand} {vehicle.model}</TableCell>
                      <TableCell className="dark:text-gray-300">{vehicle.status === "active" ? "Activo" : "Inactivo"}</TableCell>
                      <TableCell className="dark:text-gray-300">{vehicle.driverName || "Sin asignar"}</TableCell>
                      <TableCell className="dark:text-gray-300">
                        {vehicle.paidInstallments || 0}/{vehicle.totalInstallments || 0}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatCurrency((vehicle.paidInstallments || 0) * (vehicle.installmentAmount || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 dark:text-white">Historial de Pagos</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-400">Fecha</TableHead>
                    <TableHead className="dark:text-gray-400">Concepto</TableHead>
                    <TableHead className="dark:text-gray-400">Vehículo</TableHead>
                    <TableHead className="dark:text-gray-400">Método</TableHead>
                    <TableHead className="dark:text-gray-400 text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investorPayments.length > 0 ? (
                    investorPayments.map((payment) => {
                      const vehicle = investorVehicles.find(v => v.id === payment.vehicleId);
                      return (
                        <TableRow key={payment.id} className="dark:border-gray-700">
                          <TableCell className="dark:text-gray-300">{format(new Date(payment.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell className="dark:text-gray-300">{payment.concept}</TableCell>
                          <TableCell className="dark:text-gray-300">{vehicle ? vehicle.plate : "Desconocido"}</TableCell>
                          <TableCell className="dark:text-gray-300">{payment.paymentMethod}</TableCell>
                          <TableCell className="text-right dark:text-gray-300">{formatCurrency(payment.amount)}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow className="dark:border-gray-700">
                      <TableCell colSpan={5} className="text-center py-4 dark:text-gray-300">
                        No hay pagos registrados para este inversionista
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch space-y-4 print:mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="flex flex-col items-center">
              <div className="w-40 mt-8 border-t border-gray-300 dark:border-gray-600"></div>
              <p className="text-sm mt-2 dark:text-gray-300">Firma del Inversionista</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-40 mt-8 border-t border-gray-300 dark:border-gray-600"></div>
              <p className="text-sm mt-2 dark:text-gray-300">Firma Autorizada</p>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4 dark:text-gray-400 print:mt-8">
            <p>Este documento es un reporte oficial de la gestión de sus vehículos.</p>
            <p>Generado el {format(currentDate, "dd/MM/yyyy 'a las' HH:mm")}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvestorSettlement;
