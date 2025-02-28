
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import { CalendarDisplayProps } from "../types";
import { format, isSameDay, isWithinInterval } from "date-fns";

const CalendarDisplay = ({
  selectedDates,
  onSelectDates,
  selectedVehicleId,
  vehicles
}: CalendarDisplayProps) => {
  const [nonWorkingDays, setNonWorkingDays] = useState<Date[]>([]);
  const [maintenanceDays, setMaintenanceDays] = useState<Date[]>([]);

  useEffect(() => {
    const allNonWorkingDays: Date[] = [];
    const allMaintenanceDays: Date[] = [];

    if (selectedVehicleId) {
      // Si hay un vehículo seleccionado, mostrar sus días no laborables
      const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
      
      if (selectedVehicle) {
        // Días no laborables específicos del vehículo
        if (selectedVehicle.daysNotWorked && selectedVehicle.daysNotWorked.length > 0) {
          selectedVehicle.daysNotWorked.forEach(day => {
            try {
              const date = new Date(day);
              if (!isNaN(date.getTime())) {
                allNonWorkingDays.push(date);
              }
            } catch (error) {
              console.error("Error parsing date:", day);
            }
          });
        }

        // Días de mantenimiento
        if (selectedVehicle.maintenanceHistory && selectedVehicle.maintenanceHistory.length > 0) {
          selectedVehicle.maintenanceHistory.forEach(maintenance => {
            try {
              const date = new Date(maintenance.date);
              if (!isNaN(date.getTime())) {
                allMaintenanceDays.push(date);
              }
            } catch (error) {
              console.error("Error parsing maintenance date:", maintenance.date);
            }
          });
        }
      }
    } else {
      // Si no hay vehículo seleccionado, mostrar días no laborables de todos los vehículos
      vehicles.forEach(vehicle => {
        if (vehicle.daysNotWorked && vehicle.daysNotWorked.length > 0) {
          vehicle.daysNotWorked.forEach(day => {
            try {
              const date = new Date(day);
              if (!isNaN(date.getTime())) {
                allNonWorkingDays.push(date);
              }
            } catch (error) {
              console.error("Error parsing date:", day);
            }
          });
        }
        
        if (vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0) {
          vehicle.maintenanceHistory.forEach(maintenance => {
            try {
              const date = new Date(maintenance.date);
              if (!isNaN(date.getTime())) {
                allMaintenanceDays.push(date);
              }
            } catch (error) {
              console.error("Error parsing maintenance date:", maintenance.date);
            }
          });
        }
      });
    }

    setNonWorkingDays(allNonWorkingDays);
    setMaintenanceDays(allMaintenanceDays);
  }, [selectedVehicleId, vehicles]);

  // Personalización del día en el calendario
  const modifyDay = (day: Date) => {
    let classes = "";
    
    // Verificar si es un día no laborable
    const isNonWorkingDay = nonWorkingDays.some(nonWorkingDate => 
      isSameDay(nonWorkingDate, day)
    );
    
    // Verificar si es un día de mantenimiento
    const isMaintenanceDay = maintenanceDays.some(maintenanceDate => 
      isSameDay(maintenanceDate, day)
    );
    
    if (isNonWorkingDay) {
      classes = "bg-red-100 text-red-800 hover:bg-red-200";
    } else if (isMaintenanceDay) {
      classes = "bg-orange-100 text-orange-800 hover:bg-orange-200";
    }
    
    // Si está dentro de un rango seleccionado
    if (selectedDates?.from && selectedDates?.to) {
      const isInRange = isWithinInterval(day, {
        start: selectedDates.from,
        end: selectedDates.to
      });
      
      if (isInRange) {
        classes = "bg-primary/20 text-primary-foreground hover:bg-primary/30";
      }
    }
    
    return classes;
  };

  return (
    <div className="p-2 border rounded-lg bg-white">
      <Calendar
        locale={es}
        mode="range"
        selected={selectedDates}
        onSelect={onSelectDates}
        className="rounded-md"
        modifiersClassNames={{
          today: "bg-accent text-accent-foreground",
          selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        }}
        modifiers={{
          nonWorkingDay: nonWorkingDays,
          maintenanceDay: maintenanceDays
        }}
        modifiersStyles={{
          nonWorkingDay: {
            fontWeight: "bold",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "rgb(153, 27, 27)"
          },
          maintenanceDay: {
            fontWeight: "bold",
            backgroundColor: "rgba(249, 115, 22, 0.1)",
            color: "rgb(154, 52, 18)"
          }
        }}
        // Función para personalizar cada día
        components={{
          Day: ({ date, ...props }: any) => {
            const customClass = modifyDay(date);
            return (
              <div 
                className={`${props.className} ${customClass}`}
                {...props}
              >
                {format(date, "d")}
              </div>
            );
          }
        }}
      />
      
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
          <span>Día no laborable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-300"></div>
          <span>Mantenimiento</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/30"></div>
          <span>Rango seleccionado</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarDisplay;
