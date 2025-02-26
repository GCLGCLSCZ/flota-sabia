
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vehicle } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Car, User } from "lucide-react";

interface VehicleDetailsProps {
  vehicle: Vehicle;
}

export const VehicleDetails = ({ vehicle }: VehicleDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{vehicle.plate}</span>
          <span className={`text-sm px-3 py-1 rounded-full ${
            vehicle.status === 'active' ? 'bg-success/10 text-success' :
            vehicle.status === 'maintenance' ? 'bg-warning/10 text-warning' :
            'bg-destructive/10 text-destructive'
          }`}>
            {vehicle.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Marca</p>
            <p className="font-medium">{vehicle.brand}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Modelo</p>
            <p className="font-medium">{vehicle.model}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Año</p>
            <p className="font-medium">{vehicle.year}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Tarifa Diaria</p>
            <p className="font-medium">Bs {vehicle.dailyRate}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Chofer</p>
              <p className="font-medium">{vehicle.driverName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Inversor</p>
              <p className="font-medium">{vehicle.investor}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Próximo Mantenimiento</p>
              <p className="font-medium">{vehicle.nextMaintenance || 'No programado'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Ingresos Mensuales</p>
              <p className="font-medium">Bs {vehicle.monthlyEarnings || 0}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline">Editar</Button>
          <Button variant="outline" className="text-warning">Mantenimiento</Button>
          <Button variant="outline" className="text-destructive">Dar de Baja</Button>
        </div>
      </CardContent>
    </Card>
  );
};
