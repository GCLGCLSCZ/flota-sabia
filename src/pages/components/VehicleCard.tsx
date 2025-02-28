
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Vehicle } from "@/types";
import { BadgeInfo, Car, Edit, Trash2 } from "lucide-react";
import { format, differenceInDays, isAfter, isSunday, parseISO, isValid } from "date-fns";
import { useApp } from "@/context/AppContext";

const VehicleCard = ({ vehicle, onEdit, onDelete, onShowDetails }) => {
  const { payments, settings } = useApp();
  const isActive = vehicle.status === "active";
  const cardClass = isActive
    ? "border-l-4 border-l-primary"
    : "border-l-4 border-l-muted opacity-70";

  // Obtener los pagos realizados a este vehículo
  const vehiclePayments = payments.filter(p => p.vehicleId === vehicle.id);
  
  // Calcular el total pagado desde los pagos registrados, excluyendo pagos a inversionista
  const totalPaidFromPayments = vehiclePayments
    .filter(p => p.status === "completed" && !p.concept.toLowerCase().includes("inversionista"))
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Cálculo de cuotas totales y pagadas
  const totalInstallments = vehicle.totalInstallments || 0;
  const installmentAmount = vehicle.installmentAmount || 0;
  
  // Calcular cuotas pagadas basado en el monto total pagado con mayor precisión
  const calculatedPaidInstallments = installmentAmount > 0 
    ? totalPaidFromPayments / installmentAmount
    : vehicle.paidInstallments || 0;
  
  // Usar el valor calculado o el valor almacenado en el vehículo
  const paidInstallments = calculatedPaidInstallments > 0 
    ? calculatedPaidInstallments 
    : vehicle.paidInstallments || 0;
    
  // Calcular cuotas restantes del total (ahora con decimales)
  const remainingInstallments = Number((totalInstallments - paidInstallments).toFixed(2));
  
  // Usar el valor calculado para el total pagado
  const totalPaid = totalPaidFromPayments || (paidInstallments * installmentAmount);

  // Calcular la ganancia de la empresa basada en las rentas pagadas * comisión diaria
  // La comisión diaria es por cuota pagada, no un acumulado arbitrario
  const companyEarnings = Number((vehicle.dailyRate * paidInstallments).toFixed(2));
  
  // Calcular cuotas atrasadas (excluyendo domingos y días de jornada libre)
  const calculateOverdueInstallments = () => {
    if (!vehicle.contractStartDate) return 0;
    
    const startDateStr = vehicle.contractStartDate;
    if (!startDateStr || !isValid(new Date(startDateStr))) return 0;
    
    const startDate = parseISO(startDateStr);
    const today = new Date();
    
    // Si la fecha de inicio es posterior a hoy, no hay cuotas atrasadas
    if (isAfter(startDate, today)) return 0;
    
    // Obtener los días de jornada libre
    const freeDaysArray = vehicle.freeDays || [];
    
    // Calcular días transcurridos excluyendo domingos y días de jornada libre
    let dayCount = 0;
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      // Convertir la fecha actual a formato ISO (solo fecha)
      const currentDateStr = format(currentDate, "yyyy-MM-dd");
      
      // Si no es domingo y no es un día de jornada libre
      if (!isSunday(currentDate) && !freeDaysArray.includes(currentDateStr)) {
        dayCount++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Las cuotas que deberían haberse pagado hasta hoy (permite decimales)
    const expectedInstallments = dayCount;
    
    // Cuotas atrasadas = esperadas - pagadas (permitimos decimales en el resultado)
    // Si el resultado es negativo, hay 0 cuotas atrasadas
    return Math.max(0, expectedInstallments - paidInstallments);
  };
  
  const overdueInstallments = calculateOverdueInstallments();
  
  // Calcular la deuda total (cuotas atrasadas * monto de cuota)
  const totalDebt = (overdueInstallments * installmentAmount);

  // Obtener fecha del último pago
  const lastPayment = vehiclePayments.length > 0 
    ? vehiclePayments
        .filter(p => p.status === "completed" && !p.concept.toLowerCase().includes("inversionista"))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Conductor</p>
            <p className="font-medium truncate">
              {vehicle.driverName ? vehicle.driverName : "Sin asignar"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Fecha de contrato
            </p>
            <p className="font-medium">
              {vehicle.contractStartDate 
                ? format(new Date(vehicle.contractStartDate), "dd/MM/yyyy") 
                : "No registrada"}
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
          className="text-xs text-xs text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:bg-gray-700"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
