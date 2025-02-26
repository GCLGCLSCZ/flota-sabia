
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

interface Investor {
  id: string;
  name: string;
  contact: string;
  documentId: string; // CUIT/RUT
  bankAccount: string;
  vehicleCount: number;
  status: "active" | "inactive";
  lastPayment: string;
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
    },
  ]);

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

  const statusColors = {
    active: "text-success bg-success/10",
    inactive: "text-destructive bg-destructive/10",
  };

  const statusLabels = {
    active: "Activo",
    inactive: "Inactivo",
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
            {investors.map((investor) => (
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

export default Investors;
