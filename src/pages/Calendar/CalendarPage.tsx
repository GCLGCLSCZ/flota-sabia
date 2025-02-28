
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban, CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import CalendarHeader from "./components/CalendarHeader";
import VehicleSelector from "./components/VehicleSelector";
import VehicleDetails from "./components/VehicleDetails";
import CalendarDisplay from "./components/CalendarDisplay";
import NonWorkingDayDialog from "./components/NonWorkingDayDialog";
import MaintenanceDialog from "./components/MaintenanceDialog";
import { NonWorkingDay } from "./types";

const CalendarPage = () => {
  const { vehicles, updateVehicle } = useApp();
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>();
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showNonWorkingDayDialog, setShowNonWorkingDayDialog] = useState(false);
  const [applyToAllVehicles, setApplyToAllVehicles] = useState(false);
  const [newNonWorkingDay, setNewNonWorkingDay] = useState<NonWorkingDay>({
    date: new Date(),
    type: "holiday",
    reason: "",
    description: "",
  });

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!selectedVehicle && !applyToAllVehicles) {
      toast({
        title: "Selecciona un vehículo",
        description: "Debes seleccionar un vehículo o marcar la opción 'Aplicar a todos los vehículos'",
        variant: "destructive",
      });
      return;
    }
    setSelectedDates(range);
    if (range?.from && range?.to) {
      setShowNonWorkingDayDialog(true);
    }
  };

  return (
    <div className="space-y-6">
      <CalendarHeader 
        onAddNonWorkingDay={() => setShowNonWorkingDayDialog(true)}
        onAddMaintenance={() => setShowMaintenanceDialog(true)}
      />

      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        <Card className="p-4 space-y-4">
          <VehicleSelector 
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            vehicles={vehicles}
            disabled={applyToAllVehicles}
          />

          {selectedVehicle && (
            <VehicleDetails selectedVehicleId={selectedVehicle} vehicles={vehicles} />
          )}
        </Card>

        <Card className="p-4">
          <CalendarDisplay
            selectedDates={selectedDates}
            onSelectDates={handleDateSelect}
            selectedVehicleId={selectedVehicle}
            vehicles={vehicles}
          />
        </Card>
      </div>

      <NonWorkingDayDialog
        open={showNonWorkingDayDialog}
        onOpenChange={setShowNonWorkingDayDialog}
        selectedDates={selectedDates}
        newNonWorkingDay={newNonWorkingDay}
        setNewNonWorkingDay={setNewNonWorkingDay}
        applyToAllVehicles={applyToAllVehicles}
        setApplyToAllVehicles={setApplyToAllVehicles}
        selectedVehicle={selectedVehicle}
        setSelectedVehicle={setSelectedVehicle}
        vehicles={vehicles}
        updateVehicle={updateVehicle}
        toast={{ toast }}
        setSelectedDates={setSelectedDates}
      />

      <MaintenanceDialog
        open={showMaintenanceDialog}
        onOpenChange={setShowMaintenanceDialog}
        vehicles={vehicles}
      />
    </div>
  );
};

export default CalendarPage;
