import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import { Payment, Vehicle } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon, Filter, CalendarRange, List, Car, PieChart, BarChart } from "lucide-react";

type GroupBy = "vehicle" | "date" | "paymentMethod" | "none";
type ViewMode = "daily" | "weekly" | "monthly" | "custom";

interface PaymentsByVehicle {
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  totalAmount: number;
  count: number;
  payments: Payment[];
}

interface PaymentsByDate {
  date: string;
  formattedDate: string;
  totalAmount: number;
  count: number;
  payments: Payment[];
}

interface PaymentsByMethod {
  method: "cash" | "transfer";
  totalAmount: number;
  count: number;
  payments: Payment[];
}

const PaymentAnalysis = () => {
  const { payments, vehicles } = useApp();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [groupBy, setGroupBy] = useState<GroupBy>("vehicle");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");

  // Update date range based on view mode
  const updateDateRangeByViewMode = (mode: ViewMode) => {
    const today = new Date();
    
    switch (mode) {
      case "daily":
        setDateRange({ from: today, to: today });
        break;
      case "weekly":
        setDateRange({
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 })
        });
        break;
      case "monthly":
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today)
        });
        break;
      case "custom":
        // Keep current date range
        break;
    }
  };

  // Filter payments based on date range and selected vehicle
  const filteredPayments = useMemo(() => {
    if (!payments.length) return [];

    return payments.filter((payment) => {
      const paymentDate = parseISO(payment.date);
      const inDateRange = dateRange?.from && dateRange?.to 
        ? isWithinInterval(paymentDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to || dateRange.from)
          })
        : true;
      
      const matchesVehicle = selectedVehicle === "all" || payment.vehicleId === selectedVehicle;
      
      return inDateRange && matchesVehicle;
    });
  }, [payments, dateRange, selectedVehicle]);

  // Calculate totals
  const totalAmount = useMemo(() => {
    return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [filteredPayments]);

  // Group payments by vehicle
  const paymentsByVehicle = useMemo(() => {
    const groups: PaymentsByVehicle[] = [];
    
    filteredPayments.forEach((payment) => {
      const vehicle = vehicles.find(v => v.id === payment.vehicleId);
      if (!vehicle) return;
      
      const existingGroup = groups.find(g => g.vehicleId === payment.vehicleId);
      if (existingGroup) {
        existingGroup.totalAmount += payment.amount;
        existingGroup.count += 1;
        existingGroup.payments.push(payment);
      } else {
        groups.push({
          vehicleId: payment.vehicleId,
          vehiclePlate: vehicle.plate,
          vehicleModel: vehicle.model,
          totalAmount: payment.amount,
          count: 1,
          payments: [payment]
        });
      }
    });
    
    return groups.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredPayments, vehicles]);

  // Group payments by date
  const paymentsByDate = useMemo(() => {
    const groups: PaymentsByDate[] = [];
    
    filteredPayments.forEach((payment) => {
      const date = payment.date.split('T')[0];
      const paymentDate = parseISO(payment.date);
      
      const existingGroup = groups.find(g => g.date === date);
      if (existingGroup) {
        existingGroup.totalAmount += payment.amount;
        existingGroup.count += 1;
        existingGroup.payments.push(payment);
      } else {
        groups.push({
          date,
          formattedDate: format(paymentDate, "dd 'de' MMMM, yyyy", { locale: es }),
          totalAmount: payment.amount,
          count: 1,
          payments: [payment]
        });
      }
    });
    
    return groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredPayments]);

  // Group payments by method
  const paymentsByMethod = useMemo(() => {
    const groups: PaymentsByMethod[] = [];
    
    const cashPayments = filteredPayments.filter(p => p.paymentMethod === "cash");
    const transferPayments = filteredPayments.filter(p => p.paymentMethod === "transfer");
    
    if (cashPayments.length) {
      groups.push({
        method: "cash",
        totalAmount: cashPayments.reduce((sum, p) => sum + p.amount, 0),
        count: cashPayments.length,
        payments: cashPayments
      });
    }
    
    if (transferPayments.length) {
      groups.push({
        method: "transfer",
        totalAmount: transferPayments.reduce((sum, p) => sum + p.amount, 0),
        count: transferPayments.length,
        payments: transferPayments
      });
    }
    
    return groups;
  }, [filteredPayments]);

  const getPaymentMethodLabel = (method: "cash" | "transfer") => {
    return method === "cash" ? "Efectivo" : "Transferencia";
  };

  const getPaymentStatusLabel = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelado";
      default:
        return "";
    }
  };

  const getStatusBadgeColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Análisis de Pagos</h1>
          <p className="text-muted-foreground mt-1">
            Analiza y filtra los pagos de los vehículos por diferentes criterios
          </p>
        </div>
      </div>

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
              <label className="text-sm font-medium mb-2 block">Vista</label>
              <Tabs 
                defaultValue={viewMode} 
                className="w-full" 
                onValueChange={(value) => {
                  setViewMode(value as ViewMode);
                  updateDateRangeByViewMode(value as ViewMode);
                }}
              >
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="daily">Día</TabsTrigger>
                  <TabsTrigger value="weekly">Semana</TabsTrigger>
                  <TabsTrigger value="monthly">Mes</TabsTrigger>
                  <TabsTrigger value="custom">Personalizado</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rango de fechas</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarRange className="mr-2 h-4 w-4" />
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

          <div className="mt-4 flex justify-end">
            <div className="text-sm font-medium">
              <span className="mr-2">Total de pagos:</span>
              <span className="text-lg">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="by-vehicle" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
          <TabsTrigger value="by-vehicle" onClick={() => setGroupBy("vehicle")}>
            <Car className="h-4 w-4 mr-2" />
            Por Vehículo
          </TabsTrigger>
          <TabsTrigger value="by-date" onClick={() => setGroupBy("date")}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Por Fecha
          </TabsTrigger>
          <TabsTrigger value="by-method" onClick={() => setGroupBy("paymentMethod")}>
            <List className="h-4 w-4 mr-2" />
            Por Método
          </TabsTrigger>
        </TabsList>

        <TabsContent value="by-vehicle">
          {paymentsByVehicle.length > 0 ? (
            <div className="space-y-4">
              {paymentsByVehicle.map((group) => (
                <Card key={group.vehicleId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        <span>{group.vehiclePlate} - {group.vehicleModel}</span>
                      </div>
                      <Badge variant="secondary" className="text-base font-normal">
                        ${group.totalAmount.toFixed(2)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-2">
                      {group.count} pagos registrados
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{format(parseISO(payment.date), "dd/MM/yyyy")}</TableCell>
                            <TableCell>{payment.concept}</TableCell>
                            <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(payment.status)}>
                                {getPaymentStatusLabel(payment.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${payment.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No hay pagos que coincidan con los filtros seleccionados.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="by-date">
          {paymentsByDate.length > 0 ? (
            <div className="space-y-4">
              {paymentsByDate.map((group) => (
                <Card key={group.date}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        <span>{group.formattedDate}</span>
                      </div>
                      <Badge variant="secondary" className="text-base font-normal">
                        ${group.totalAmount.toFixed(2)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-2">
                      {group.count} pagos registrados
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehículo</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.payments.map((payment) => {
                          const vehicle = vehicles.find((v) => v.id === payment.vehicleId);
                          return (
                            <TableRow key={payment.id}>
                              <TableCell>
                                {vehicle ? `${vehicle.plate} - ${vehicle.model}` : "Desconocido"}
                              </TableCell>
                              <TableCell>{payment.concept}</TableCell>
                              <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeColor(payment.status)}>
                                  {getPaymentStatusLabel(payment.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${payment.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No hay pagos que coincidan con los filtros seleccionados.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="by-method">
          {paymentsByMethod.length > 0 ? (
            <div className="space-y-4">
              {paymentsByMethod.map((group) => (
                <Card key={group.method}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <List className="h-5 w-5" />
                        <span>{getPaymentMethodLabel(group.method)}</span>
                      </div>
                      <Badge variant="secondary" className="text-base font-normal">
                        ${group.totalAmount.toFixed(2)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-2">
                      {group.count} pagos registrados
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Vehículo</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.payments.map((payment) => {
                          const vehicle = vehicles.find((v) => v.id === payment.vehicleId);
                          return (
                            <TableRow key={payment.id}>
                              <TableCell>{format(parseISO(payment.date), "dd/MM/yyyy")}</TableCell>
                              <TableCell>
                                {vehicle ? `${vehicle.plate} - ${vehicle.model}` : "Desconocido"}
                              </TableCell>
                              <TableCell>{payment.concept}</TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeColor(payment.status)}>
                                  {getPaymentStatusLabel(payment.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${payment.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No hay pagos que coincidan con los filtros seleccionados.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentAnalysis;
