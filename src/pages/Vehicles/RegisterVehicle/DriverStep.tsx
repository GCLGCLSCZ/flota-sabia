
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { Driver } from "@/types";

interface DriverStepProps {
  selectedDriver: string;
  onDriverSelect: (id: string, name: string, phone: string) => void;
  onNewDriver: (driver: Omit<Driver, "id" | "status" | "vehicleId">) => void;
}

export const DriverStep = ({ selectedDriver, onDriverSelect, onNewDriver }: DriverStepProps) => {
  const { drivers } = useApp();
  const [isNewDriver, setIsNewDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    ci: "",
    documentId: "",
    licenseNumber: "",
    licenseExpiry: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const handleAddDriver = () => {
    // Add new driver
    onNewDriver({
      ...newDriver,
    });
    setIsNewDriver(false);
  };

  const handleDriverSelect = (driver: Driver) => {
    onDriverSelect(driver.id, driver.name, driver.phone);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Seleccionar Conductor</h2>
        {!isNewDriver ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`border p-4 rounded-lg cursor-pointer ${
                    selectedDriver === driver.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => handleDriverSelect(driver)}
                >
                  <div className="font-medium">{driver.name}</div>
                  <div className="text-sm text-muted-foreground">
                    CI: {driver.ci} | Teléfono: {driver.phone}
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewDriver(true)}
            >
              Agregar Nuevo Conductor
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driver-name">Nombre Completo</Label>
                <Input
                  id="driver-name"
                  value={newDriver.name}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-phone">Teléfono</Label>
                <Input
                  id="driver-phone"
                  value={newDriver.phone}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-ci">Cédula de Identidad</Label>
                <Input
                  id="driver-ci"
                  value={newDriver.ci}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, ci: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-document">Documento de Identidad</Label>
                <Input
                  id="driver-document"
                  value={newDriver.documentId}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, documentId: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-license">Número de Licencia</Label>
                <Input
                  id="driver-license"
                  value={newDriver.licenseNumber}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, licenseNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-expiry">Vencimiento de Licencia</Label>
                <Input
                  id="driver-expiry"
                  type="date"
                  value={newDriver.licenseExpiry}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, licenseExpiry: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-address">Dirección</Label>
                <Input
                  id="driver-address"
                  value={newDriver.address}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-emergency-contact">Contacto de Emergencia</Label>
                <Input
                  id="driver-emergency-contact"
                  value={newDriver.emergencyContact}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, emergencyContact: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-emergency-phone">Teléfono de Emergencia</Label>
                <Input
                  id="driver-emergency-phone"
                  value={newDriver.emergencyPhone}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, emergencyPhone: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewDriver(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleAddDriver}>
                Guardar Conductor
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
