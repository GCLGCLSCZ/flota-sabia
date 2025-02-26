
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { PaymentSummary } from "./PaymentSummary";
import { PaymentHistory } from "./PaymentHistory";
import { NewPaymentDialog } from "./NewPaymentDialog";

const Payments = () => {
  const [showNewPaymentDialog, setShowNewPaymentDialog] = useState(false);

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
        <PaymentSummary />
        <PaymentHistory />
      </div>

      <NewPaymentDialog 
        open={showNewPaymentDialog}
        onOpenChange={setShowNewPaymentDialog}
      />
    </div>
  );
};

export default Payments;
