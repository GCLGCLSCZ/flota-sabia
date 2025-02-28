
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Vehicle } from "@/types";
import { BadgeInfo, Car, Edit, Trash2 } from "lucide-react";
import VehicleCardHeader from "./VehicleCardHeader";
import VehiclePaymentInfo from "./VehiclePaymentInfo";
import VehicleDriverInfo from "./VehicleDriverInfo";
import VehicleNonWorkingDays from "./VehicleNonWorkingDays";
import { useVehicleCardData } from "./useVehicleCardData";

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onShowDetails: (vehicle: Vehicle) => void;
}

const VehicleCard = ({ vehicle, onEdit, onDelete, onShowDetails }: VehicleCardProps) => {
  const {
    isActive,
    cardClass,
    paidInstallments,
    remainingInstallments,
    totalInstallments,
    installmentAmount,
    totalPaid,
    overdueInstallments,
    totalDebt,
    lastPayment
  } = useVehicleCardData(vehicle);

  return (
    <Card className={`${cardClass} dark:bg-gray-800 dark:text-white dark:border-gray-700`}>
      <VehicleCardHeader 
        vehicle={vehicle}
        isActive={isActive}
      />
      
      <CardContent className="p-4 pt-0 text-sm space-y-2 overflow-visible">
        <VehiclePaymentInfo
          vehicle={vehicle}
          paidInstallments={paidInstallments}
          totalPaid={totalPaid}
          overdueInstallments={overdueInstallments}
          remainingInstallments={remainingInstallments}
          totalInstallments={totalInstallments}
          totalDebt={totalDebt}
          lastPayment={lastPayment}
          installmentAmount={installmentAmount}
        />
        
        <VehicleDriverInfo vehicle={vehicle} />
        
        {(vehicle.daysNotWorked && vehicle.daysNotWorked.length > 0) && (
          <VehicleNonWorkingDays daysNotWorked={vehicle.daysNotWorked} />
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between p-4 pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={() => onShowDetails(vehicle)}
        >
          <BadgeInfo className="h-3.5 w-3.5 mr-1.5" />
          Detalles
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={() => onEdit(vehicle)}
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs text-xs text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:bg-gray-700"
          onClick={() => onDelete(vehicle)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
