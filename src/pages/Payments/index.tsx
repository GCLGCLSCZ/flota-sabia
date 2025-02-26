
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { NewPaymentDialog } from "./components/NewPaymentDialog";
import { PaymentSummary } from "./components/PaymentSummary";
import { PaymentHistory } from "./components/PaymentHistory";
import { useApp } from "@/context/AppContext";

const Payments = () => {
  const { vehicles, payments, addPayment } = useApp();
  const [showNewPaymentDialog, setShowNewPaymentDialog] = useState(false);

  const handleNewPayment = (paymentData: any) => {
    addPayment(paymentData);
  };

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
        <PaymentSummary vehicles={vehicles} payments={payments} />
        <PaymentHistory payments={payments} vehicles={vehicles} />
      </div>

      <NewPaymentDialog
        open={showNewPaymentDialog}
        onOpenChange={setShowNewPaymentDialog}
        vehicles={vehicles}
        onSubmit={handleNewPayment}
      />
    </div>
  );
};

export default Payments;
