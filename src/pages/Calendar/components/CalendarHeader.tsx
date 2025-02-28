
import { Button } from "@/components/ui/button";
import { Ban, CalendarIcon } from "lucide-react";
import { CalendarHeaderProps } from "../types";

const CalendarHeader = ({ onAddNonWorkingDay, onAddMaintenance }: CalendarHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold">Calendario de Vehículos</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los días no trabajados y mantenimientos programados
        </p>
      </div>
      <div className="space-x-4">
        <Button variant="outline" onClick={onAddNonWorkingDay}>
          <Ban className="mr-2 h-4 w-4" />
          Marcar Día No Laborable
        </Button>
        <Button onClick={onAddMaintenance}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Programar Mantenimiento
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
