
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  Settings,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Maintenance {
  id: string;
  date: string;
  description: string;
  costMaterials: number;
  salePrice: number;
  status: "pending" | "in-progress" | "completed";
}

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  status: "active" | "maintenance" | "inactive";
  investor: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceHistory?: Maintenance[];
  daysNotWorked?: string[];
  dailyRate?: number;
  monthlyEarnings?: number;
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
      lastMaintenance: "2024-02-15",
      nextMaintenance: "2024-04-15",
      dailyRate: 21,
      monthlyEarnings: 630,
      maintenanceHistory: [
        {
          id: "m1",
          date: "2024-02-15",
          description: "Cambio de aceite y filtros",
          costMaterials: 200,
          salePrice: 300,
          status: "completed",
        },
      ],
      daysNotWorked: ["2024-03-01", "2024-03-02"],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    date: "",
    description: "",
    costMaterials: 0,
    salePrice: 0,
  });

  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
    investor: "",
    dailyRate: 21,
  });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle: Vehicle = {
      id: Date.now().toString(),
      ...newVehicle,
      status: "active",
      monthlyEarnings: newVehicle.dailyRate * 30,
      maintenanceHistory: [],
      daysNotWorked: [],
    };
    setVehicles([...vehicles, vehicle]);
    setNewVehicle({
      plate: "",
      brand: "",
      model: "",
      year: "",
      investor: "",
      dailyRate: 21,
    });
    toast({
      title: "Vehículo agregado",
      description: "El vehículo ha sido registrado exitosamente.",
    });
  };

  const handleEditVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    setVehicles(
      vehicles.map((v) =>
        v.id === editingVehicle.id ? editingVehicle : v
      )
    );
    setEditingVehicle(null);
    toast({
      title: "Vehículo actualizado",
      description: "Los datos del vehículo han sido actualizados exitosamente.",
    });
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(vehicles.filter((v) => v.id !== vehicleId));
    setShowDeleteDialog(false);
    toast({
      title: "Vehículo eliminado",
      description: "El vehículo ha sido eliminado exitosamente.",
      variant: "destructive",
    });
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const maintenance: Maintenance = {
      id: Date.now().toString(),
      ...newMaintenance,
      status: "pending",
    };

    const updatedVehicle = {
      ...selectedVehicle,
      maintenanceHistory: [
        ...(selectedVehicle.maintenanceHistory || []),
        maintenance,
      ],
      lastMaintenance: newMaintenance.date,
    };

    setVehicles(
      vehicles.map((v) =>
        v.id === selectedVehicle.id ? updatedVehicle : v
      )
    );

    setNewMaintenance({
      date: "",
      description: "",
      costMaterials: 0,
      salePrice: 0,
    });

    setShowMaintenanceDialog(false);
    toast({
      title: "Mantenimiento registrado",
      description: "El mantenimiento ha sido registrado exitosamente.",
    });
  };

  const statusColors = {
    active: "text-success bg-success/10",
    maintenance: "text-warning bg-warning/10",
    inactive: "text-destructive bg-destructive/10",
    pending: "text-warning bg-warning/10",
    "in-progress": "text-info bg-info/10",
    completed: "text-success bg-success/10",
  };

  const statusLabels = {
    active: "Activo",
    maintenance: "En Mantenimiento",
    inactive: "Inactivo",
    pending: "Pendiente",
    "in-progress": "En Proceso",
    completed: "Completado",
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.investor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de Vehículos</h1>
          <p className="text-muted-foreground mt-1">
            Administra los vehículos y sus mantenimientos
          </p>
        </div>
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
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Tarifa Diaria (Bs)</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    value={newVehicle.dailyRate}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        dailyRate: Number(e.target.value),
                      })
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

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Buscar por placa, marca, modelo o inversor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
              <TableHead>Último Mant.</TableHead>
              <TableHead>Próximo Mant.</TableHead>
              <TableHead>Ganancia Mensual</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
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
                <TableCell>{vehicle.lastMaintenance || "-"}</TableCell>
                <TableCell>{vehicle.nextMaintenance || "-"}</TableCell>
                <TableCell>Bs {vehicle.monthlyEarnings || "-"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowDetails(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingVehicle(vehicle)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Diálogo de Detalles */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles del Vehículo</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Historial de Mantenimientos */}
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Historial de Mantenimientos
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => setShowMaintenanceDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {selectedVehicle.maintenanceHistory?.map((maintenance) => (
                      <div
                        key={maintenance.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{maintenance.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {maintenance.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            Ganancia: Bs{" "}
                            {maintenance.salePrice - maintenance.costMaterials}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[maintenance.status]
                            }`}
                          >
                            {statusLabels[maintenance.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Días No Trabajados */}
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Días No Trabajados
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {selectedVehicle.daysNotWorked?.map((day) => (
                      <div
                        key={day}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{day}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Edición */}
      <Dialog
        open={editingVehicle !== null}
        onOpenChange={() => setEditingVehicle(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vehículo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditVehicle} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-plate">Placa</Label>
                <Input
                  id="edit-plate"
                  value={editingVehicle?.plate || ""}
                  onChange={(e) =>
                    setEditingVehicle(
                      editingVehicle
                        ? { ...editingVehicle, plate: e.target.value }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Marca</Label>
                <Input
                  id="edit-brand"
                  value={editingVehicle?.brand || ""}
                  onChange={(e) =>
                    setEditingVehicle(
                      editingVehicle
                        ? { ...editingVehicle, brand: e.target.value }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model">Modelo</Label>
                <Input
                  id="edit-model"
                  value={editingVehicle?.model || ""}
                  onChange={(e) =>
                    setEditingVehicle(
                      editingVehicle
                        ? { ...editingVehicle, model: e.target.value }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Año</Label>
                <Input
                  id="edit-year"
                  value={editingVehicle?.year || ""}
                  onChange={(e) =>
                    setEditingVehicle(
                      editingVehicle
                        ? { ...editingVehicle, year: e.target.value }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  value={editingVehicle?.status || "active"}
                  onValueChange={(value: "active" | "maintenance" | "inactive") =>
                    setEditingVehicle(
                      editingVehicle
                        ? { ...editingVehicle, status: value }
                        : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="maintenance">En Mantenimiento</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-investor">Inversor</Label>
                <Input
                  id="edit-investor"
                  value={editingVehicle?.investor || ""}
                  onChange={(e) =>
                    setEditingVehicle(
                      editingVehicle
                        ? { ...editingVehicle, investor: e.target.value }
                        : null
                    )
                  }
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

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el vehículo{" "}
              {selectedVehicle?.plate}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedVehicle && handleDeleteVehicle(selectedVehicle.id)
              }
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Nuevo Mantenimiento */}
      <Dialog
        open={showMaintenanceDialog}
        onOpenChange={setShowMaintenanceDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Mantenimiento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMaintenance} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenance-date">Fecha</Label>
                <Input
                  id="maintenance-date"
                  type="date"
                  value={newMaintenance.date}
                  onChange={(e) =>
                    setNewMaintenance({
                      ...newMaintenance,
                      date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-description">Descripción</Label>
                <Input
                  id="maintenance-description"
                  value={newMaintenance.description}
                  onChange={(e) =>
                    setNewMaintenance({
                      ...newMaintenance,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-cost">Costo de Materiales (Bs)</Label>
                <Input
                  id="maintenance-cost"
                  type="number"
                  value={newMaintenance.costMaterials}
                  onChange={(e) =>
                    setNewMaintenance({
                      ...newMaintenance,
                      costMaterials: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-price">Precio de Venta (Bs)</Label>
                <Input
                  id="maintenance-price"
                  type="number"
                  value={newMaintenance.salePrice}
                  onChange={(e) =>
                    setNewMaintenance({
                      ...newMaintenance,
                      salePrice: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="submit">Registrar Mantenimiento</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vehicles;
