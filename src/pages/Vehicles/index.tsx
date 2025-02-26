
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types";
import { Plus } from "lucide-react";
import { VehicleList } from "./components/VehicleList";
import { VehicleDetails } from "./components/VehicleDetails";
import { useApp } from "@/context/AppContext";

const Vehicles = () => {
  const { vehicles } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehículos</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Vehículo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <VehicleList
          vehicles={vehicles}
          onSelectVehicle={setSelectedVehicle}
        />
        {selectedVehicle && (
          <div className="lg:sticky lg:top-6">
            <VehicleDetails vehicle={selectedVehicle} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;
