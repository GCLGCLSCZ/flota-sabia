
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  status: "active" | "maintenance" | "inactive";
  investor: string;
}

const Vehicles = () => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: "1",
      plate: "ABC-123",
      brand: "Toyota",
      model: "Corolla",
      year: "2020",
      status: "active",
      investor: "Juan Pérez",
    },
    {
      id: "2",
      plate: "XYZ-789",
      brand: "Nissan",
      model: "Sentra",
      year: "2021",
      status: "maintenance",
      investor: "María García",
    },
  ]);

  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
    investor: "",
  });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle: Vehicle = {
      id: Date.now().toString(),
      ...newVehicle,
      status: "active",
    };
    setVehicles([...vehicles, vehicle]);
    setNewVehicle({
      plate: "",
      brand: "",
      model: "",
      year: "",
      investor: "",
    });
    toast({
      title: "Vehículo agregado",
      description: "El vehículo ha sido registrado exitosamente.",
    });
  };

  const statusColors = {
    active: "text-success bg-success/10",
    maintenance: "text-warning bg-warning/10",
    inactive: "text-destructive bg-destructive/10",
  };

  const statusLabels = {
    active: "Activo",
    maintenance: "En Mantenimiento",
    inactive: "Inactivo",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Gestión de Vehículos</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Vehículo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plate">Placa</Label>
                  <Input
                    id="plate"
                    value={newVehicle.plate}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, plate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={newVehicle.brand}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, brand: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    value={newVehicle.model}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, model: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Año</Label>
                  <Input
                    id="year"
                    value={newVehicle.year}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, year: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="investor">Inversor</Label>
                  <Input
                    id="investor"
                    value={newVehicle.investor}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, investor: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="submit">Guardar Vehículo</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Inversor</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.plate}</TableCell>
                <TableCell>{vehicle.brand}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[vehicle.status]
                    }`}
                  >
                    {statusLabels[vehicle.status]}
                  </span>
                </TableCell>
                <TableCell>{vehicle.investor}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
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

export default Vehicles;
