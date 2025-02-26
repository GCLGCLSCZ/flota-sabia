
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarHeader } from "./components/CalendarHeader";
import { CalendarGrid } from "./components/CalendarGrid";
import { EventForm } from "./components/EventForm";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const onPrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const onNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  // Ejemplo de datos para el calendario
  const mockDays = Array.from({ length: 35 }, (_, i) => ({
    date: i + 1,
    isCurrentMonth: i < 31,
    events: i % 5 === 0 ? [{
      id: `event-${i}`,
      title: 'Evento ejemplo',
      type: 'maintenance' as const
    }] : undefined
  }));

  return (
    <div className="space-y-6">
      <CalendarHeader
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        currentMonth={format(currentDate, 'MMMM yyyy', { locale: es })}
      />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
        <CalendarGrid days={mockDays} />
        <EventForm />
      </div>
    </div>
  );
};

export default Calendar;
