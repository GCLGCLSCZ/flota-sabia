
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Vehicle } from "@/types";
import { BadgeInfo, Car, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useApp } from "@/context/AppContext";

const VehicleCard = ({ vehicle, onEdit, onDelete, onShowDetails }) => {
  const { payments } = useApp();
  const isActive = vehicle.status === "active";
  const cardClass = isActive
    ? "border-l-4 border-l-primary"
    : "border-l-4 border-l-muted opacity-70";

  // Obtener los pagos realizados a este vehículo
  const vehiclePayments = payments.filter(p => p.vehicleId === vehicle.id);
  
  // Calcular el total pagado desde los pagos registrados
  const totalPaidFromPayments = vehiclePayments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Cálculo de cuotas totales y pagadas
  const totalInstallments = vehicle.totalInstallments || 0;
  const installmentAmount = vehicle.installmentAmount || 0;
  
  // Calcular cuotas pagadas basado en el monto total pagado
  const calculatedPaidInstallments = installmentAmount > 0 
    ? Math.floor(totalPaidFromPayments / installmentAmount) 
    : vehicle.paidInstallments || 0;
  
  // Usar el valor calculado o el valor almacenado en el vehículo
  const paidInstallments = calculatedPaidInstallments > 0 
    ? calculatedPaidInstallments 
    : vehicle.paidInstallments || 0;
    
  // Calcular cuotas restantes
  const remainingInstallments = totalInstallments - paidInstallments;
  
  // Usar el valor calculado para el total pagado
  const totalPaid = totalPaidFromPayments || (paidInstallments * installmentAmount);

  return (
    <Card className={`${cardClass} dark:bg-gray-800 dark:text-white dark:border-gray-700`}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-md md:text-lg dark:text-white flex items-center">
              <Car className="h-4 w-4 mr-2 inline" />
              {vehicle.plate}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm mt-1 dark:text-gray-400">
              {vehicle.brand} {vehicle.model} - {vehicle.year}
            </CardDescription>
          </div>
          <div className="text-xs md:text-sm font-medium rounded-full px-2 py-1 bg-opacity-20">
            <span
              className={`${
                isActive ? "text-success" : "text-muted-foreground"
              }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm space-y-2 overflow-visible">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Comisión empresa</p>
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
            <p className="text-xs text-muted-foreground dark:text-gray-400">Cuotas restantes</p>
            <p className="font-medium">{remainingInstallments} / {totalInstallments}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Total pagado
            </p>
            <p className="font-medium">{totalPaid} Bs</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Pagos registrados</p>
            <p className="font-medium">{vehiclePayments.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Último pago
            </p>
            <p className="font-medium">
              {vehiclePayments.length > 0 
                ? format(new Date(vehiclePayments[vehiclePayments.length - 1].date), "dd/MM/yyyy") 
                : "Sin pagos"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Conductor</p>
            <p className="font-medium truncate">
              {vehicle.driverName ? vehicle.driverName : "Sin asignar"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Inversionista
            </p>
            <p className="font-medium truncate">
              {vehicle.investor ? vehicle.investor : "Sin asignar"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={onShowDetails}
        >
          <BadgeInfo className="h-3.5 w-3.5 mr-1.5" />
          Detalles
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={onEdit}
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:bg-gray-700"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
