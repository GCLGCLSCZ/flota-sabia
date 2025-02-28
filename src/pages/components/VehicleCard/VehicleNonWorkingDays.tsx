
/**
 * Componente que muestra los días en que un vehículo no ha trabajado.
 * Útil para realizar seguimiento de días sin actividad y calcular correctamente los ingresos.
 * 
 * @param daysNotWorked - Array de fechas en formato string que representa los días no trabajados
 */
interface VehicleNonWorkingDaysProps {
  daysNotWorked: string[];
}

const VehicleNonWorkingDays = ({ daysNotWorked }: VehicleNonWorkingDaysProps) => {
  return (
    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      <p className="text-xs text-muted-foreground dark:text-gray-400">Días no trabajados</p>
      <p className="font-medium">{daysNotWorked.length} días</p>
    </div>
  );
};

export default VehicleNonWorkingDays;
