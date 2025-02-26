
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
import { Edit, Trash2, Car } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Driver } from "@/types";
import { useApp } from "@/context/AppContext";

interface DriversTableProps {
  onEdit: (driver: Driver) => void;
}

export const DriversTable = ({ onEdit }: DriversTableProps) => {
  const { drivers, updateDriver } = useApp();
  const { toast } = useToast();

  const handleDelete = (driverId: string) => {
    updateDriver(driverId, { status: "inactive" });
    toast({
      title: "Chofer eliminado",
      description: "El chofer ha sido eliminado exitosamente.",
      variant: "destructive",
    });
  };

  return (
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
                  onClick={() => onEdit(driver)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(driver.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
