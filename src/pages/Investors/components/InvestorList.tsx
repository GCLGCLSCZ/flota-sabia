
import { Card } from "@/components/ui/card";
import { Investor } from "@/types";
import { Users, DollarSign, Car } from "lucide-react";

interface InvestorListProps {
  investors: Investor[];
  onSelectInvestor: (investor: Investor) => void;
}

export const InvestorList = ({ investors, onSelectInvestor }: InvestorListProps) => {
  return (
    <div className="space-y-4">
      {investors.map((investor) => (
        <Card
          key={investor.id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectInvestor(investor)}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{investor.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  investor.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {investor.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Car className="w-4 h-4" />
                  <span>{investor.vehicleCount} vehículos</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Último pago: {investor.lastPayment}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
