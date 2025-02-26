
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Edit, Trash2, User, Car } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Driver } from "@/types";
import { useApp } from "@/context/AppContext";

const DriversPage = () => {
  const { drivers, addDriver, updateDriver } = useApp();
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    documentId: "",
    licenseNumber: "",
    licenseExpiry: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const success = addDriver(newDriver);
    if (success) {
      setNewDriver({
        name: "",
        phone: "",
        documentId: "",
        licenseNumber: "",
        licenseExpiry: "",
        address: "",
        emergencyContact: "",
        emergencyPhone: "",
      });
      toast({
        title: "Chofer agregado",
        description: "El chofer ha sido registrado exitosamente.",
      });
    }
  };

  const handleEditDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    updateDriver(editingDriver.id, editingDriver);
    setEditingDriver(null);
    toast({
      title: "Chofer actualizado",
      description: "Los datos del chofer han sido actualizados exitosamente.",
    });
  };

  const handleDeleteDriver = (driverId: string) => {
    updateDriver(driverId, { status: "inactive" });
    toast({
      title: "Chofer eliminado",
      description: "El chofer ha sido eliminado exitosamente.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de Choferes</h1>
          <p className="text-muted-foreground mt-1">
            Administra los choferes y sus asignaciones
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar Chofer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Chofer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDriver} className="space-y-4">
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
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Licencia</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vehículo Asignado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="font-medium">{driver.name}</TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell>{driver.documentId}</TableCell>
                <TableCell>{driver.licenseNumber}</TableCell>
                <TableCell>{driver.licenseExpiry}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {driver.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell>
                  {driver.vehicleId ? (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>Placa: {driver.vehicleId}</span>
                    </div>
                  ) : (
                    "Sin asignar"
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingDriver(driver)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDriver(driver.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default DriversPage;
