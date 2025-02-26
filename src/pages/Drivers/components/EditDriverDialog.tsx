
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Driver } from "@/types";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/use-toast";

interface EditDriverDialogProps {
  driver: Driver | null;
  onClose: () => void;
}

export const EditDriverDialog = ({ driver, onClose }: EditDriverDialogProps) => {
  const { updateDriver } = useApp();
  const { toast } = useToast();

  if (!driver) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDriver(driver.id, driver);
    toast({
      title: "Chofer actualizado",
      description: "Los datos del chofer han sido actualizados exitosamente.",
    });
    onClose();
  };

  return (
    <Dialog open={!!driver} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Chofer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo</Label>
              <Input
                id="edit-name"
                value={driver.name}
                onChange={(e) => updateDriver(driver.id, { ...driver, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={driver.phone}
                onChange={(e) => updateDriver(driver.id, { ...driver, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-documentId">Documento de Identidad</Label>
              <Input
                id="edit-documentId"
                value={driver.documentId}
                onChange={(e) => updateDriver(driver.id, { ...driver, documentId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-licenseNumber">Número de Licencia</Label>
              <Input
                id="edit-licenseNumber"
                value={driver.licenseNumber}
                onChange={(e) => updateDriver(driver.id, { ...driver, licenseNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-licenseExpiry">Vencimiento de Licencia</Label>
              <Input
                id="edit-licenseExpiry"
                type="date"
                value={driver.licenseExpiry}
                onChange={(e) => updateDriver(driver.id, { ...driver, licenseExpiry: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input
                id="edit-address"
                value={driver.address}
                onChange={(e) => updateDriver(driver.id, { ...driver, address: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergencyContact">Contacto de Emergencia</Label>
              <Input
                id="edit-emergencyContact"
                value={driver.emergencyContact}
                onChange={(e) => updateDriver(driver.id, { ...driver, emergencyContact: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergencyPhone">Teléfono de Emergencia</Label>
              <Input
                id="edit-emergencyPhone"
                value={driver.emergencyPhone}
                onChange={(e) => updateDriver(driver.id, { ...driver, emergencyPhone: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
