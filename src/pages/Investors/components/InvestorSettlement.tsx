
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { format, parseISO, differenceInDays, isAfter, isSunday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { es } from "date-fns/locale";
import { Payment, Vehicle } from "@/types";
import "./settlement-print.css";

const InvestorSettlement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { investors, vehicles, payments } = useApp();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Encontrar el inversor y sus vehículos
  const investor = investors.find((inv) => inv.id === id);
  const investorVehicles = vehicles.filter((v) => v.investor === investor?.name);

  useEffect(() => {
    // Establecer fechas por defecto si no están definidas
    if (!startDate || !endDate) {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setStartDate(firstDay);
      setEndDate(lastDay);
    }
  }, []);

  // Filtrar pagos por período
  const filteredPayments = useMemo(() => {
    if (!startDate || !endDate || !investor) return [];
    
    return payments.filter((payment) => {
      const paymentDate = parseISO(payment.date);
      const isInRange = 
        paymentDate >= startDate && 
        paymentDate <= endDate;
      
      // Verificar si el pago corresponde a un vehículo del inversor
      const isInvestorVehicle = investorVehicles.some(
        (v) => v.id === payment.vehicleId
      );
      
      return isInRange && isInvestorVehicle;
    });
  }, [payments, startDate, endDate, investor, investorVehicles]);

  // Calcular pagos totales
  const calculateTotals = () => {
    let totalPaid = 0;
    let totalInvestorAmount = 0;
    let totalCompanyAmount = 0;
    
    investorVehicles.forEach(vehicle => {
      // Filtrar pagos para este vehículo
      const vehiclePayments = filteredPayments.filter(
        p => p.vehicleId === vehicle.id && p.status === "completed"
      );
      
      // Sumar todos los pagos
      const paidAmount = vehiclePayments.reduce((sum, p) => sum + p.amount, 0);
      totalPaid += paidAmount;
      
      // Calcular días en el período (excluyendo domingos)
      let daysInPeriod = 0;
      if (startDate && endDate) {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (!isSunday(currentDate)) {
            daysInPeriod++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      
      // Calcular comisión de la empresa (tarifa diaria * días trabajados)
      const companyAmount = vehicle.dailyRate * daysInPeriod;
      totalCompanyAmount += companyAmount;
      
      // Lo que queda para el inversor
      const investorAmount = paidAmount - companyAmount;
      totalInvestorAmount += investorAmount;
    });
    
    return {
      totalPaid,
      totalInvestorAmount,
      totalCompanyAmount
    };
  };

  const { totalPaid, totalInvestorAmount, totalCompanyAmount } = calculateTotals();

  const handlePrint = () => {
    window.print();
  };

  if (!investor) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold">Inversor no encontrado</h2>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 print:p-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <div className="space-x-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <div id="printable-content" className="bg-white print:m-0">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Liquidación de Inversor</h1>
            <h2 className="text-xl">{investor.name}</h2>
            <p className="text-muted-foreground">Documento: {investor.documentId}</p>
            <p className="text-muted-foreground">Contacto: {investor.contact}</p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-medium">Periodo:</span>{" "}
              {startDate && format(startDate, "dd/MM/yyyy")} -{" "}
              {endDate && format(endDate, "dd/MM/yyyy")}
            </p>
            <p>
              <span className="font-medium">Fecha emisión:</span>{" "}
              {format(new Date(), "dd/MM/yyyy")}
            </p>
            <p>
              <span className="font-medium">Vehículos:</span> {investorVehicles.length}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <h3 className="text-lg font-medium mb-2">Vehículos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {investorVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardHeader className="bg-muted py-2 px-4">
                <CardTitle className="text-sm font-medium flex justify-between">
                  <span>{vehicle.plate}</span>
                  <span className={vehicle.status === "active" ? "text-success" : "text-destructive"}>
                    {vehicle.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground">Modelo:</p>
                    <p>{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conductor:</p>
                    <p>{vehicle.driverName || "Sin asignar"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Comisión diaria:</p>
                    <p>{vehicle.dailyRate} Bs</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contrato:</p>
                    <p>
                      {vehicle.contractStartDate
                        ? format(parseISO(vehicle.contractStartDate), "dd/MM/yyyy")
                        : "No registrado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h3 className="text-lg font-medium mb-2">Pagos del período</h3>
        <div className="border rounded-md overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-muted">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                  Fecha
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                  Vehículo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                  Concepto
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted bg-background">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => {
                  const paymentVehicle = investorVehicles.find(
                    (v) => v.id === payment.vehicleId
                  );
                  return (
                    <tr key={payment.id}>
                      <td className="px-4 py-2 text-sm">
                        {format(parseISO(payment.date), "dd/MM/yyyy")}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {paymentVehicle?.plate || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm">{payment.concept}</td>
                      <td className="px-4 py-2 text-sm text-right">
                        {payment.amount} Bs
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">
                    No hay pagos registrados en este período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-sm">Total Recaudado</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-4 pb-4">
              <p className="text-2xl font-bold">{totalPaid} Bs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-sm">Comisión de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-4 pb-4">
              <p className="text-2xl font-bold">{totalCompanyAmount} Bs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-sm">A Liquidar al Inversor</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-4 pb-4">
              <p className="text-2xl font-bold">{totalInvestorAmount} Bs</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-4" />

        <div className="mt-8 print:fixed print:bottom-10 print:w-full">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <Separator className="my-4 mx-auto w-3/4" />
              <p>Empresa</p>
            </div>
            <div className="text-center">
              <Separator className="my-4 mx-auto w-3/4" />
              <p>Inversionista</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorSettlement;
