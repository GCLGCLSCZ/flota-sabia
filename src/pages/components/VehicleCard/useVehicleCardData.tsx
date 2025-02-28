
import { useApp } from "@/context/AppContext";
import { Vehicle } from "@/types";
import { differenceInDays, format, isAfter, isSunday, isValid, parseISO } from "date-fns";

/**
 * Hook personalizado que calcula y proporciona datos financieros y de estado para un vehículo.
 * 
 * Realiza los siguientes cálculos:
 * - Estado del vehículo (activo/inactivo)
 * - Cuotas pagadas y pendientes
 * - Total pagado hasta la fecha
 * - Cuotas atrasadas y deuda total
 * - Ingresos generados
 * - Último pago registrado
 * 
 * @param vehicle - Objeto con la información del vehículo
 * @returns Objeto con todos los datos calculados para mostrar en la tarjeta del vehículo
 */
export const useVehicleCardData = (vehicle: Vehicle) => {
  const { payments } = useApp();
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
  const companyEarnings = Number((vehicle.dailyRate * paidInstallments).toFixed(2));
  
  /**
   * Calcula las cuotas atrasadas excluyendo domingos y días marcados como no laborables
   * Es importante para determinar si hay retrasos en los pagos del vehículo.
   */
  const calculateOverdueInstallments = () => {
    if (!vehicle.contractStartDate) return 0;
    
    const startDateStr = vehicle.contractStartDate;
    if (!startDateStr || !isValid(new Date(startDateStr))) return 0;
    
    const startDate = parseISO(startDateStr);
    const today = new Date();
    
    // Si la fecha de inicio es posterior a hoy, no hay cuotas atrasadas
    if (isAfter(startDate, today)) return 0;
    
    // Obtener días no laborables específicos para este vehículo
    const nonWorkingDays = vehicle.daysNotWorked || [];
    const nonWorkingDatesSet = new Set(nonWorkingDays.map(day => day.split('T')[0]));
    
    // Calcular días transcurridos excluyendo domingos y días no laborables
    let dayCount = 0;
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      // Convertir la fecha actual a formato YYYY-MM-DD para comparar con daysNotWorked
      const currentDateStr = currentDate.toISOString().split('T')[0];
      
      // Si no es domingo y no está en la lista de días no laborables
      if (!isSunday(currentDate) && !nonWorkingDatesSet.has(currentDateStr)) {
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

  return {
    isActive,
    cardClass,
    vehiclePayments,
    totalPaidFromPayments,
    totalInstallments,
    installmentAmount,
    paidInstallments,
    remainingInstallments,
    totalPaid,
    companyEarnings,
    overdueInstallments,
    totalDebt,
    lastPayment
  };
};
