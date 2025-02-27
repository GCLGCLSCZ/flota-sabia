
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import { CalendarDisplayProps } from "../types";

const CalendarDisplay = ({ 
  selectedDates, 
  onSelectDates, 
  selectedVehicleId, 
  vehicles 
}: CalendarDisplayProps) => {
  
  const getHighlightedDays = () => {
    const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicleId);
    const vehicleDaysOff = selectedVehicleData?.daysNotWorked?.map(d => new Date(d)) || [];
    
    // Añadir todos los domingos del año actual
    const currentYear = new Date().getFullYear();
    const sundays: Date[] = [];
    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= new Date(currentYear, month + 1, 0).getDate(); day++) {
        const date = new Date(currentYear, month, day);
        if (date.getDay() === 0) { // 0 es domingo
          sundays.push(date);
        }
      }
    }
    
    // Añadir fechas de mantenimiento
    const maintenanceDays = selectedVehicleData?.maintenanceHistory?.map(m => new Date(m.date)) || [];
    
    return [...vehicleDaysOff, ...sundays, ...maintenanceDays];
  };

  const getMaintenanceDays = () => {
    const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicleId);
    return selectedVehicleData?.maintenanceHistory?.map(m => new Date(m.date)) || [];
  };

  return (
    <CalendarComponent
      mode="range"
      selected={selectedDates}
      onSelect={onSelectDates}
      modifiers={{
        daysOff: getHighlightedDays(),
        maintenance: getMaintenanceDays(),
      }}
      modifiersStyles={{
        daysOff: { backgroundColor: "#FEE2E2" },
        maintenance: { backgroundColor: "#DBEAFE" },
      }}
      locale={es}
      className="w-full"
    />
  );
};

export default CalendarDisplay;
