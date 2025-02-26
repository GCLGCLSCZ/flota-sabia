
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

export const DriversHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold">Gestión de Choferes</h1>
        <p className="text-muted-foreground mt-1">
          Administra los choferes y sus asignaciones
        </p>
      </div>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Chofer
        </Button>
      </DialogTrigger>
    </div>
  );
};
