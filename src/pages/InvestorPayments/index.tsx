
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, CreditCard, Filter, Car } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

const InvestorPayments = () => {
  const navigate = useNavigate();
  const { payments, vehicles, investors } = useApp();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [selectedInvestor, setSelectedInvestor] = useState<string>("all");

  // Filtrar pagos de inversionistas
  const investorPayments = useMemo(() => {
    return payments.filter(payment => 
      payment.status === "completed" &&
      payment.concept.toLowerCase().includes("inversionista")
    );
  }, [payments]);

  // Aplicar filtros
  const filteredPayments = useMemo(() => {
    if (!investorPayments.length) return [];
    
    return investorPayments.filter(payment => {
      // Filtro por rango de fechas
      const paymentDate = parseISO(payment.date);
      const inDateRange = dateRange?.from && dateRange?.to 
        ? isWithinInterval(paymentDate, {
            start: dateRange.from,
            end: dateRange.to
          })
        : true;
      
      // Filtro por vehículo
      const matchesVehicle = selectedVehicle === "all" || payment.vehicleId === selectedVehicle;
      
      // Filtro por inversionista
      const vehicle = vehicles.find(v => v.id === payment.vehicleId);
      const investorName = vehicle ? vehicle.investor : "";
      const matchesInvestor = selectedInvestor === "all" || investorName === selectedInvestor;
      
      return inDateRange && matchesVehicle && matchesInvestor;
    });
  }, [investorPayments, dateRange, selectedVehicle, selectedInvestor, vehicles]);

  // Calcular totales
  const totals = useMemo(() => {
    // Total pagado a inversores
    const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calcular comisiones de administración
    const adminCommission = filteredPayments.reduce((sum, payment) => {
      const vehicle = vehicles.find(v => v.id === payment.vehicleId);
      if (vehicle && vehicle.dailyRate && vehicle.installmentAmount) {
        const installmentsPaid = payment.amount / vehicle.installmentAmount;
        return sum + (installmentsPaid * vehicle.dailyRate);
      }
      return sum;
    }, 0);
    
    // Calcular ingresos por GPS
    const gpsIncome = filteredPayments.length * 120; // Suponiendo 120 Bs por vehículo
    
    // Calcular ingresos por mantenimientos
    const maintenanceIncome = vehicles.reduce((sum, vehicle) => {
      if (!vehicle.maintenanceHistory) return sum;
      
      return sum + vehicle.maintenanceHistory.reduce((vehicleSum, maintenance) => {
        const maintenanceDate = parseISO(maintenance.date);
        const inDateRange = dateRange?.from && dateRange?.to 
          ? isWithinInterval(maintenanceDate, {
              start: dateRange.from,
              end: dateRange.to
            })
          : false;
        
        if (inDateRange && maintenance.status === "completed") {
          // Ganancia = precio de venta - costos
          const profit = maintenance.salePrice - maintenance.cost;
          return vehicleSum + profit;
        }
        return vehicleSum;
      }, 0);
    }, 0);
    
    return {
      totalPaid,
      adminCommission,
      gpsIncome,
      maintenanceIncome,
      totalIncome: adminCommission + gpsIncome + maintenanceIncome
    };
  }, [filteredPayments, vehicles, dateRange]);

  // Obtener el nombre del inversionista por ID de vehículo
  const getInvestorName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.investor : "Desconocido";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Pagos a Inversionistas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y analiza los pagos realizados a los inversionistas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rango de fechas</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Selecciona un rango de fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Inversionista</label>
              <Select
                value={selectedInvestor}
                onValueChange={setSelectedInvestor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los inversionistas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los inversionistas</SelectItem>
                  {investors.map((investor) => (
                    <SelectItem key={investor.id} value={investor.name}>
                      {investor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Vehículo</label>
              <Select
                value={selectedVehicle}
                onValueChange={setSelectedVehicle}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los vehículos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los vehículos</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Resumen Financiero */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Pagado a Inversionistas</div>
                <div className="text-2xl font-bold text-red-600">{totals.totalPaid.toFixed(2)} Bs</div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Comisión Administrativa</div>
                <div className="text-2xl font-bold text-green-600">{totals.adminCommission.toFixed(2)} Bs</div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Ingreso por GPS</div>
                <div className="text-2xl font-bold text-green-600">{totals.gpsIncome.toFixed(2)} Bs</div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Ingreso por Mantenimientos</div>
                <div className="text-2xl font-bold text-green-600">{totals.maintenanceIncome.toFixed(2)} Bs</div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground dark:text-gray-300">Total Ingresos</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totals.totalIncome.toFixed(2)} Bs</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalle de Pagos a Inversionistas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Inversionista</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Transferencia</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const vehicle = vehicles.find(v => v.id === payment.vehicleId);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{format(parseISO(payment.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{getInvestorName(payment.vehicleId)}</TableCell>
                      <TableCell>
                        {vehicle ? `${vehicle.plate} - ${vehicle.model}` : "Desconocido"}
                      </TableCell>
                      <TableCell>{payment.concept}</TableCell>
                      <TableCell>{payment.bankName || "-"}</TableCell>
                      <TableCell>{payment.transferNumber || "-"}</TableCell>
                      <TableCell className="text-right font-medium">{payment.amount.toFixed(2)} Bs</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Obtener el inversionista
                            const investorName = getInvestorName(payment.vehicleId);
                            const investor = investors.find(inv => inv.name === investorName);
                            if (investor) {
                              navigate(`/investors/${investor.id}/settlement`);
                            }
                          }}
                        >
                          Ver Rendición
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No hay pagos a inversionistas que coincidan con los filtros seleccionados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorPayments;
