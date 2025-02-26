
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Printer, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Vehicle, Payment } from "@/types";

export const PaymentHistory = () => {
  const { vehicles, payments } = useApp();
  const { toast } = useToast();

  const handlePrintReceipt = (payment: Payment) => {
    toast({
      title: "Imprimiendo recibo",
      description: `Recibo #${payment.receiptNumber}`,
    });
  };

  const handleWhatsAppReceipt = (payment: Payment, vehicle: Vehicle) => {
    const receiptText = `*Recibo de Pago #${payment.receiptNumber}*
🚗 Vehículo: ${vehicle.plate} - ${vehicle.model}
💵 Monto: $${payment.amount}
📅 Fecha: ${format(payment.date, "dd/MM/yyyy")}
🧾 Concepto: ${payment.concept}
💳 Método de pago: ${payment.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
${payment.bankName ? `🏦 Banco: ${payment.bankName}` : ""}
${payment.transferNumber ? `🔢 N° Transferencia: ${payment.transferNumber}` : ""}`;

    const whatsappUrl = `https://wa.me/${vehicle.driverPhone}?text=${encodeURIComponent(receiptText)}`;
    window.open(whatsappUrl, "_blank");
  };

  const getStatusColor = (status: Payment["status"]) => {
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

  const getStatusText = (status: Payment["status"]) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historial de Pagos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => {
            const vehicle = vehicles.find((v) => v.id === payment.vehicleId);
            return (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    <span className="font-medium">
                      {vehicle?.plate} - {vehicle?.model}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {payment.concept}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(payment.date, "dd/MM/yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Recibo #{payment.receiptNumber} - 
                    {payment.paymentMethod === "cash" ? "Efectivo" : `Transferencia ${payment.bankName}`}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="font-medium">${payment.amount}</p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => vehicle && handleWhatsAppReceipt(payment, vehicle)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
