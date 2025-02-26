
import { Card } from "@/components/ui/card";

interface Payment {
  plate: string;
  days: number;
  amount: string;
}

interface LatePaymentsCardProps {
  payments: Payment[];
}

export const LatePaymentsCard = ({ payments }: LatePaymentsCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Vehículos con Pagos Atrasados</h3>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.plate}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium">{payment.plate}</p>
              <p className="text-sm text-gray-600">
                {payment.days} días de atraso
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-warning">{payment.amount}</p>
              <button className="text-sm text-primary hover:underline">
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
