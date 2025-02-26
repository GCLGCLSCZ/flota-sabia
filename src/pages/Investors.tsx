
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
  Plus,
  Edit,
  Trash2,
  Search,
  Car,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  year: string;
  status: "active" | "maintenance" | "inactive";
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  concept: string;
  status: "completed" | "pending" | "late";
}

interface Investor {
  id: string;
  name: string;
  contact: string;
  documentId: string;
  bankAccount: string;
  vehicleCount: number;
  status: "active" | "inactive";
  lastPayment: string;
  vehicles?: Vehicle[];
  payments?: Payment[];
}

const Investors = () => {
  const { toast } = useToast();
  const [investors, setInvestors] = useState<Investor[]>([
    {
      id: "1",
      name: "Juan Pérez",
      contact: "+591 77712345",
      documentId: "1234567890",
      bankAccount: "1234-5678-9012-3456",
      vehicleCount: 2,
      status: "active",
      lastPayment: "2024-03-15",
      vehicles: [
        {
          id: "v1",
          plate: "ABC-123",
          model: "Toyota Corolla",
          year: "2020",
          status: "active",
        },
        {
          id: "v2",
          plate: "DEF-456",
          model: "Nissan Sentra",
          year: "2021",
          status: "maintenance",
        },
      ],
      payments: [
        {
          id: "p1",
          date: "2024-03-15",
          amount: 1500,
          concept: "Cuota Marzo",
          status: "completed",
        },
        {
          id: "p2",
          date: "2024-02-15",
          amount: 1500,
          concept: "Cuota Febrero",
          status: "completed",
        },
      ],
    },
    {
      id: "2",
      name: "María García",
      contact: "+591 77798765",
      documentId: "0987654321",
      bankAccount: "9876-5432-1098-7654",
      vehicleCount: 1,
      status: "active",
      lastPayment: "2024-03-10",
      vehicles: [
        {
          id: "v3",
          plate: "GHI-789",
          model: "Honda Civic",
          year: "2022",
          status: "active",
        },
      ],
      payments: [
        {
          id: "p3",
          date: "2024-03-10",
          amount: 1200,
          concept: "Cuota Marzo",
          status: "completed",
        },
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newInvestor, setNewInvestor] = useState({
    name: "",
    contact: "",
    documentId: "",
    bankAccount: "",
  });

  const handleAddInvestor = (e: React.FormEvent) => {
    e.preventDefault();
    const investor: Investor = {
      id: Date.now().toString(),
      ...newInvestor,
      vehicleCount: 0,
      status: "active",
      lastPayment: "-",
      vehicles: [],
      payments: [],
    };
    setInvestors([...investors, investor]);
    setNewInvestor({
      name: "",
      contact: "",
      documentId: "",
      bankAccount: "",
    });
    toast({
      title: "Inversor agregado",
      description: "El inversor ha sido registrado exitosamente.",
    });
  };

  const handleEditInvestor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvestor) return;

    setInvestors(
      investors.map((inv) =>
        inv.id === editingInvestor.id ? editingInvestor : inv
      )
    );
    setEditingInvestor(null);
    toast({
      title: "Inversor actualizado",
      description: "Los datos del inversor han sido actualizados exitosamente.",
    });
  };

  const handleDeleteInvestor = (investorId: string) => {
    setInvestors(investors.filter((inv) => inv.id !== investorId));
    setShowDeleteDialog(false);
    toast({
      title: "Inversor eliminado",
      description: "El inversor ha sido eliminado exitosamente.",
      variant: "destructive",
    });
  };

  const filteredInvestors = investors.filter(
    (investor) =>
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.documentId.includes(searchTerm) ||
      investor.contact.includes(searchTerm)
  );

  const statusColors = {
    active: "text-success bg-success/10",
    inactive: "text-destructive bg-destructive/10",
    maintenance: "text-warning bg-warning/10",
    completed: "text-success bg-success/10",
    pending: "text-warning bg-warning/10",
    late: "text-destructive bg-destructive/10",
  };

  const statusLabels = {
    active: "Activo",
    inactive: "Inactivo",
    maintenance: "En Mantenimiento",
    completed: "Completado",
    pending: "Pendiente",
    late: "Atrasado",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de Inversores</h1>
          <p className="text-muted-foreground mt-1">
            Administra los inversores y sus vehículos asociados
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Inversor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Inversor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddInvestor} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Juan Pérez"
                    value={newInvestor.name}
                    onChange={(e) =>
                      setNewInvestor({ ...newInvestor, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Teléfono de Contacto</Label>
                  <Input
                    id="contact"
                    placeholder="Ej: +591 77712345"
                    value={newInvestor.contact}
                    onChange={(e) =>
                      setNewInvestor({ ...newInvestor, contact: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentId">CUIT/RUT</Label>
                  <Input
                    id="documentId"
                    placeholder="Ej: 1234567890"
                    value={newInvestor.documentId}
                    onChange={(e) =>
                      setNewInvestor({ ...newInvestor, documentId: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Cuenta Bancaria</Label>
                  <Input
                    id="bankAccount"
                    placeholder="Ej: 1234-5678-9012-3456"
                    value={newInvestor.bankAccount}
                    onChange={(e) =>
                      setNewInvestor({ ...newInvestor, bankAccount: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="submit">Guardar Inversor</Button>
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
            placeholder="Buscar por nombre, documento o contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>CUIT/RUT</TableHead>
              <TableHead>Cuenta Bancaria</TableHead>
              <TableHead>Vehículos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Último Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvestors.map((investor) => (
              <TableRow key={investor.id}>
                <TableCell className="font-medium">{investor.name}</TableCell>
                <TableCell>{investor.contact}</TableCell>
                <TableCell>{investor.documentId}</TableCell>
                <TableCell>{investor.bankAccount}</TableCell>
                <TableCell>{investor.vehicleCount}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[investor.status]
                    }`}
                  >
                    {statusLabels[investor.status]}
                  </span>
                </TableCell>
                <TableCell>{investor.lastPayment}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedInvestor(investor);
                      setShowDetails(true);
                    }}
                  >
                    <Car className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingInvestor(investor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedInvestor(investor);
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
            <DialogTitle>Detalles del Inversor</DialogTitle>
          </DialogHeader>
          {selectedInvestor && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Vehículos Asociados */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehículos Asociados
                  </h3>
                  <div className="space-y-4">
                    {selectedInvestor.vehicles?.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{vehicle.plate}</p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.model} ({vehicle.year})
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[vehicle.status]
                          }`}
                        >
                          {statusLabels[vehicle.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Historial de Pagos */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Historial de Pagos
                  </h3>
                  <div className="space-y-4">
                    {selectedInvestor.payments?.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{payment.concept}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Bs {payment.amount}</p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[payment.status]
                            }`}
                          >
                            {statusLabels[payment.status]}
                          </span>
                        </div>
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
        open={editingInvestor !== null}
        onOpenChange={() => setEditingInvestor(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Inversor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditInvestor} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre Completo</Label>
                <Input
                  id="edit-name"
                  value={editingInvestor?.name || ""}
                  onChange={(e) =>
                    setEditingInvestor(
                      editingInvestor
                        ? { ...editingInvestor, name: e.target.value }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact">Teléfono de Contacto</Label>
                <Input
                  id="edit-contact"
                  value={editingInvestor?.contact || ""}
                  onChange={(e) =>
                    setEditingInvestor(
                      editingInvestor
                        ? { ...editingInvestor, contact: e.target.value }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-documentId">CUIT/RUT</Label>
                <Input
                  id="edit-documentId"
                  value={editingInvestor?.documentId || ""}
                  onChange={(e) =>
                    setEditingInvestor(
                      editingInvestor
                        ? { ...editingInvestor, documentId: e.target.value }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bankAccount">Cuenta Bancaria</Label>
                <Input
                  id="edit-bankAccount"
                  value={editingInvestor?.bankAccount || ""}
                  onChange={(e) =>
                    setEditingInvestor(
                      editingInvestor
                        ? { ...editingInvestor, bankAccount: e.target.value }
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
              ¿Estás seguro de que deseas eliminar al inversor{" "}
              {selectedInvestor?.name}? Esta acción no se puede deshacer.
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
                selectedInvestor && handleDeleteInvestor(selectedInvestor.id)
              }
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Investors;
