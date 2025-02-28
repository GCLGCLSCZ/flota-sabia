
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Vehicle } from "@/types";
import { Car } from "lucide-react";

interface VehicleCardHeaderProps {
  vehicle: Vehicle;
  isActive: boolean;
}

const VehicleCardHeader = ({ vehicle, isActive }: VehicleCardHeaderProps) => {
  return (
    <CardHeader className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-md md:text-lg dark:text-white flex items-center">
            <Car className="h-4 w-4 mr-2 inline" />
            {vehicle.plate}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm mt-1 dark:text-gray-400">
            {vehicle.brand} {vehicle.model} - {vehicle.year}
          </CardDescription>
        </div>
        <div className="text-xs md:text-sm font-medium rounded-full px-2 py-1 bg-opacity-20">
          <span
            className={`${
              isActive ? "text-success" : "text-muted-foreground"
            }`}
          >
            {isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>
    </CardHeader>
  );
};

export default VehicleCardHeader;
