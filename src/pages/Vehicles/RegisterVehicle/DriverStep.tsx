
import { Driver } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

interface DriverStepProps {
  selectedDriver: string;
  onDriverSelect: (driverId: string, name: string, phone: string) => void;
  onNewDriver: (driver: Omit<Driver, "id" | "status" | "vehicleId">) => void;
}

export const DriverStep = ({
  selectedDriver,
  onDriverSelect,
  onNewDriver,
}: DriverStepProps) => {
  const { drivers } = useApp();
  const [isNewDriver, setIsNewDriver] = useState(false);
  const [newDriverData, setNewDriverData] = useState({
    name: "",
    phone: "",
    documentId: "",
    licenseNumber: "",
    licenseExpiry: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const handleSubmitNewDriver = () => {
    onNewDriver(newDriverData);
    onDriverSelect("new", newDriverData.name, newDriverData.phone);
    setIsNewDriver(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Seleccionar Chofer</Label>
        <Select
          value={isNewDriver ? "new" : selectedDriver}
          onValueChange={(value) => {
            if (value === "new") {
              setIsNewDriver(true);
            } else {
              const driver = drivers.find((d) => d.id === value);
              if (driver) {
                onDriverSelect(driver.id, driver.name, driver.phone);
              }
              setIsNewDriver(false);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un chofer" />
          </SelectTrigger>
          <SelectContent>
            {drivers
              .filter((driver) => !driver.vehicleId)
              .map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            <SelectItem value="new">+ Nuevo Chofer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isNewDriver && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="driverName">Nombre Completo</Label>
            <Input
              id="driverName"
              value={newDriverData.name}
              onChange={(e) =>
                setNewDriverData({ ...newDriverData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={newDriverData.phone}
              onChange={(e) =>
                setNewDriverData({ ...newDriverData, phone: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentId">Documento de Identidad</Label>
            <Input
              id="documentId"
              value={newDriverData.documentId}
              onChange={(e) =>
                setNewDriverData({ ...newDriverData, documentId: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Número de Licencia</Label>
            <Input
              id="licenseNumber"
              value={newDriverData.licenseNumber}
              onChange={(e) =>
                setNewDriverData({
                  ...newDriverData,
                  licenseNumber: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseExpiry">Vencimiento de Licencia</Label>
            <Input
              id="licenseExpiry"
              type="date"
              value={newDriverData.licenseExpiry}
              onChange={(e) =>
                setNewDriverData({
                  ...newDriverData,
                  licenseExpiry: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={newDriverData.address}
              onChange={(e) =>
                setNewDriverData({ ...newDriverData, address: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
            <Input
              id="emergencyContact"
              value={newDriverData.emergencyContact}
              onChange={(e) =>
                setNewDriverData({
                  ...newDriverData,
                  emergencyContact: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
            <Input
              id="emergencyPhone"
              value={newDriverData.emergencyPhone}
              onChange={(e) =>
                setNewDriverData({
                  ...newDriverData,
                  emergencyPhone: e.target.value,
                })
              }
              required
            />
          </div>
          <Button
            className="col-span-2"
            onClick={handleSubmitNewDriver}
          >
            Guardar Chofer
          </Button>
        </div>
      )}
    </div>
  );
};
