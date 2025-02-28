
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types";
import { Loader } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

interface DeleteVehicleDialogProps {
  vehicle: Vehicle | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
}

const DeleteVehicleDialog = ({ vehicle, onConfirm, onClose }: DeleteVehicleDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { refreshData } = useApp();

  if (!vehicle) return null;

  const handleDelete = async () => {
    if (!vehicle || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      // Primero ejecutamos la función normal de eliminación
      onConfirm(vehicle.id);
      
      // Si estamos usando Supabase, hacemos una eliminación completa
      if (supabase) {
        console.log(`Eliminando completamente el vehículo ${vehicle.id}...`);
        
        // Eliminar registros relacionados
        await Promise.all([
          // Eliminar mantenimientos relacionados
          supabase.from('maintenance').delete().eq('vehicle_id', vehicle.id),
          
          // Eliminar cardex relacionados
          supabase.from('cardex').delete().eq('vehicle_id', vehicle.id),
          
          // Eliminar descuentos relacionados
          supabase.from('discounts').delete().eq('vehicle_id', vehicle.id),
          
          // Eliminar días no trabajados relacionados
          supabase.from('days_not_worked').delete().eq('vehicle_id', vehicle.id),
          
          // Eliminar días libres relacionados
          supabase.from('free_days').delete().eq('vehicle_id', vehicle.id),
        ]);
        
        // Finalmente, eliminar el vehículo
        await supabase.from('vehicles').delete().eq('id', vehicle.id);
        
        // Refrescar los datos para asegurarnos de que todo está actualizado
        await refreshData();
      }
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el vehículo {vehicle.plate}? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVehicleDialog;
