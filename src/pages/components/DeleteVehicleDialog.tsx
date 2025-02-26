
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types";

interface DeleteVehicleDialogProps {
  vehicle: Vehicle | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
}

const DeleteVehicleDialog = ({ vehicle, onConfirm, onClose }: DeleteVehicleDialogProps) => {
  if (!vehicle) return null;

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
          <Button variant="destructive" onClick={() => onConfirm(vehicle.id)}>
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVehicleDialog;
