
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Payment, Vehicle } from "@/types";
import { format } from "date-fns";

interface PaymentSummaryProps {
  vehicles: Vehicle[];
  payments: Payment[];
}

export const PaymentSummary = ({ vehicles, payments }: PaymentSummaryProps) => {
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((acc, payment) => acc + payment.amount, 0);
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const lastPayment = payments[payments.length - 1];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Pagos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Total pagos</p>
            <p className="text-2xl font-bold">{totalPayments}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Monto total</p>
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Pagos pendientes</p>
            <p className="text-2xl font-bold">{pendingPayments}</p>
          </div>
          {lastPayment && (
            <div>
              <p className="text-sm font-medium">Último pago</p>
              <p className="text-lg">${lastPayment.amount}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(lastPayment.date), "dd/MM/yyyy")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
