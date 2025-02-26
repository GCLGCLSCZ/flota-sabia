
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  onPrevMonth: () => void;
  onNextMonth: () => void;
  currentMonth: string;
}

export const CalendarHeader = ({ onPrevMonth, onNextMonth, currentMonth }: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Calendario</h1>
        <Select defaultValue="month">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar vista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Vista Mensual</SelectItem>
            <SelectItem value="week">Vista Semanal</SelectItem>
            <SelectItem value="day">Vista Diaria</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-medium min-w-[200px] text-center">
          {currentMonth}
        </div>
        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
