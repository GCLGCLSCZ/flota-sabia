
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Investor } from "@/types";
import { User, Phone, Car, DollarSign } from "lucide-react";

interface InvestorDetailsProps {
  investor: Investor;
}

export const InvestorDetails = ({ investor }: InvestorDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{investor.name}</span>
          <span className={`text-sm px-3 py-1 rounded-full ${
            investor.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
            {investor.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Documento de Identidad</p>
              <p className="font-medium">{investor.documentId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Contacto</p>
              <p className="font-medium">{investor.contact}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Vehículos</p>
              <p className="font-medium">{investor.vehicleCount} vehículos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Cuenta Bancaria</p>
              <p className="font-medium">{investor.bankAccount}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <h4 className="font-medium">Vehículos del Inversor</h4>
          <div className="space-y-2">
            {investor.vehicles?.map((vehicle) => (
              <div
                key={vehicle.id}
                className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{vehicle.plate}</p>
                  <p className="text-sm text-gray-600">
                    {vehicle.brand} {vehicle.model} {vehicle.year}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vehicle.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {vehicle.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Editar</Button>
          <Button variant="outline" className="text-destructive">
            Dar de Baja
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
