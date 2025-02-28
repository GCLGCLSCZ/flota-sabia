
import { Vehicle } from "@/types";
import { format } from "date-fns";

interface VehiclePaymentInfoProps {
  vehicle: Vehicle;
  paidInstallments: number;
  totalPaid: number;
  overdueInstallments: number;
  remainingInstallments: number;
  totalInstallments: number;
  totalDebt: number;
  lastPayment: any;
  installmentAmount: number;
}

const VehiclePaymentInfo = ({
  vehicle,
  paidInstallments,
  totalPaid,
  overdueInstallments,
  remainingInstallments,
  totalInstallments,
  totalDebt,
  lastPayment,
  installmentAmount
}: VehiclePaymentInfoProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">Comisión diaria</p>
          <p className="font-medium">{vehicle.dailyRate} Bs</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Cuota diaria
          </p>
          <p className="font-medium">{installmentAmount} Bs</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Cuotas pagadas
          </p>
          <p className="font-medium">{paidInstallments.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Total pagado
          </p>
          <p className="font-medium">{totalPaid.toFixed(0)} Bs</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">Cuotas atrasadas</p>
          <p className={`font-medium ${overdueInstallments > 0 ? "text-destructive" : ""}`}>
            {overdueInstallments.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Cuotas restantes
          </p>
          <p className="font-medium">{remainingInstallments.toFixed(2)} / {totalInstallments}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Deuda actual
          </p>
          <p className={`font-medium ${totalDebt > 0 ? "text-destructive" : ""}`}>
            {totalDebt.toFixed(0)} Bs
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Último pago
          </p>
          <p className="font-medium">
            {lastPayment 
              ? format(new Date(lastPayment.date), "dd/MM/yyyy") 
              : "Sin pagos"}
          </p>
        </div>
      </div>
    </>
  );
};

export default VehiclePaymentInfo;
