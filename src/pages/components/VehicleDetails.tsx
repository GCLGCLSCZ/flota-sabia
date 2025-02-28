
import { useEffect, useState } from "react";
import { Vehicle, Maintenance } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface VehicleDetailsProps {
  selectedVehicleId: string;
  vehicles: Vehicle[];
}

const VehicleDetails = ({ selectedVehicleId, vehicles }: VehicleDetailsProps) => {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      setSelectedVehicle(vehicle || null);
      
      if (vehicle && vehicle.maintenanceHistory) {
        setMaintenance(vehicle.maintenanceHistory);
      } else {
        setMaintenance([]);
      }
    } else {
      setSelectedVehicle(null);
      setMaintenance([]);
    }
  }, [selectedVehicleId, vehicles]);

  if (!selectedVehicle) {
    return <div>Selecciona un vehículo para ver sus detalles</div>;
  }

  // Ordenar mantenimientos por fecha, los más recientes primero
  const sortedMaintenance = [...maintenance].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedMaintenance.length > 0 ? (
        sortedMaintenance.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <div className="font-medium">
                  {format(new Date(item.date), "dd/MM/yyyy")}
                </div>
                <div className={`px-2 py-0.5 text-xs rounded-full ${
                  item.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : item.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {item.status === "completed"
                    ? "Completado"
                    : item.status === "pending"
                    ? "Pendiente"
                    : "Cancelado"}
                </div>
              </div>
              <p className="text-sm mb-2">{item.description}</p>
              <div className="grid grid-cols-2 text-sm text-muted-foreground">
                <div>
                  <div>Materiales: Bs {item.costMaterials}</div>
                  <div>Mano de obra: Bs {item.costLabor}</div>
                </div>
                <div className="text-right">
                  <div>Costo total: Bs {item.cost}</div>
                  {item.salePrice > 0 && (
                    <div>Precio venta: Bs {item.salePrice}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center p-4 text-muted-foreground">
          No hay registros de mantenimiento para este vehículo
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;
