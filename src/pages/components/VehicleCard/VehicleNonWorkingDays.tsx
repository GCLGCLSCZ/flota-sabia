
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
