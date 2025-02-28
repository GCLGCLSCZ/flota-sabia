
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface DeleteVehicleDialogProps {
  vehicle: Vehicle | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
}

const DeleteVehicleDialog = ({ vehicle, onConfirm, onClose }: DeleteVehicleDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!vehicle) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(vehicle.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el vehículo <strong>{vehicle.plate}</strong>? 
            Esta acción marcará el vehículo como inactivo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVehicleDialog;
