
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface VehiclesHeaderProps {
  onAddClick: () => void;
}

export const VehiclesHeader = ({ onAddClick }: VehiclesHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold">Gestión de Vehículos</h1>
        <p className="text-muted-foreground mt-1">
          Administra tu flota de vehículos y sus asignaciones
        </p>
      </div>
      <Button onClick={onAddClick}>
        <UserPlus className="mr-2 h-4 w-4" />
        Agregar Vehículo
      </Button>
    </div>
  );
};
