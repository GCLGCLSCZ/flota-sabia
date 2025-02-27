
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Driver } from "@/types";
import { useApp } from "@/context/AppContext";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const initialDriverState: Omit<Driver, "id"> = {
  name: "",
  phone: "",
  ci: "",
  documentId: "",
  licenseNumber: "",
  licenseExpiry: "",
  address: "",
  emergencyContact: "",
  emergencyPhone: "",
  status: "active"
};

export const AddDriverForm = () => {
  const { addDriver } = useApp();
  const { toast } = useToast();
  const [newDriver, setNewDriver] = useState<Omit<Driver, "id">>(initialDriverState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = addDriver(newDriver);
    if (success) {
      setNewDriver(initialDriverState);
      toast({
        title: "Chofer agregado",
        description: "El chofer ha sido registrado exitosamente.",
      });
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Agregar Nuevo Chofer</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={newDriver.name}
              onChange={(e) =>
                setNewDriver({ ...newDriver, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={newDriver.phone}
              onChange={(e) =>
                setNewDriver({ ...newDriver, phone: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci">Cédula de Identidad</Label>
            <Input
              id="ci"
              value={newDriver.ci}
              onChange={(e) =>
                setNewDriver({ ...newDriver, ci: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentId">Documento de Identidad</Label>
            <Input
              id="documentId"
              value={newDriver.documentId}
              onChange={(e) =>
                setNewDriver({ ...newDriver, documentId: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Número de Licencia</Label>
            <Input
              id="licenseNumber"
              value={newDriver.licenseNumber}
              onChange={(e) =>
                setNewDriver({ ...newDriver, licenseNumber: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseExpiry">Vencimiento de Licencia</Label>
            <Input
              id="licenseExpiry"
              type="date"
              value={newDriver.licenseExpiry}
              onChange={(e) =>
                setNewDriver({ ...newDriver, licenseExpiry: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={newDriver.address}
              onChange={(e) =>
                setNewDriver({ ...newDriver, address: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
            <Input
              id="emergencyContact"
              value={newDriver.emergencyContact}
              onChange={(e) =>
                setNewDriver({ ...newDriver, emergencyContact: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
            <Input
              id="emergencyPhone"
              value={newDriver.emergencyPhone}
              onChange={(e) =>
                setNewDriver({ ...newDriver, emergencyPhone: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button type="submit">Guardar Chofer</Button>
        </div>
      </form>
    </DialogContent>
  );
};
