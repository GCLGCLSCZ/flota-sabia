
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
import { useApp } from "@/context/AppContext";

export const PaymentSummary = () => {
  const { vehicles, payments } = useApp();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumen de Pagos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vehicles.map((vehicle) => {
          const vehiclePayments = payments.filter(
            (p) => p.vehicleId === vehicle.id
          );
          const totalPaid = vehiclePayments
            .filter((p) => p.status === "completed")
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
                <p>Total pagado: ${totalPaid}</p>
                <p>Pagos pendientes: {pendingPayments}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
