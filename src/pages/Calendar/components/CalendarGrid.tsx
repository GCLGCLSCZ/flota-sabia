
import { Card } from "@/components/ui/card";

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  events?: Array<{
    id: string;
    title: string;
    type: 'maintenance' | 'payment' | 'driver';
  }>;
}

interface CalendarGridProps {
  days: CalendarDay[];
}

export const CalendarGrid = ({ days }: CalendarGridProps) => {
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center font-medium text-sm text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-[100px] p-2 border rounded-lg ${
              day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            <div className={`text-sm ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
              {day.date}
            </div>
            <div className="mt-1 space-y-1">
              {day.events?.map((event) => (
                <div
                  key={event.id}
                  className="text-xs p-1 rounded-md bg-primary/10 text-primary"
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
