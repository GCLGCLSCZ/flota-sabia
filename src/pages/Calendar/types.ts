
import { Vehicle } from "@/types";
import { DateRange } from "react-day-picker";
import { ToastAction } from "@/components/ui/toast";

export interface NonWorkingDay {
  date: Date;
  reason: string;
  description: string;
  type: "holiday" | "maintenance" | "civic_strike" | "retention" | "other";
}

export interface CalendarHeaderProps {
  onAddNonWorkingDay: () => void;
  onAddMaintenance: () => void;
}

export interface VehicleSelectorProps {
  selectedVehicle: string;
  setSelectedVehicle: (id: string) => void;
  vehicles: Vehicle[];
  disabled: boolean;
}

export interface VehicleDetailsProps {
  selectedVehicleId: string;
  vehicles: Vehicle[];
}

export interface CalendarDisplayProps {
  selectedDates: DateRange | undefined;
  onSelectDates: (range: DateRange | undefined) => void;
  selectedVehicleId: string;
  vehicles: Vehicle[];
}

export interface NonWorkingDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: DateRange | undefined;
  setSelectedDates: (dates: DateRange | undefined) => void;
  newNonWorkingDay: NonWorkingDay;
  setNewNonWorkingDay: (day: NonWorkingDay) => void;
  applyToAllVehicles: boolean;
  setApplyToAllVehicles: (apply: boolean) => void;
  selectedVehicle: string;
  setSelectedVehicle: (id: string) => void;
  vehicles: Vehicle[];
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  toast: {
    toast: (props: {
      title?: string;
      description?: string;
      action?: React.ReactElement<typeof ToastAction>;
      variant?: "default" | "destructive";
    }) => void;
  };
}

export interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
}
