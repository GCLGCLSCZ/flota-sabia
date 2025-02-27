
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Investor, Vehicle } from "@/types";
import { useNavigate } from "react-router-dom";

interface InvestorSelectorProps {
  formData: Partial<Vehicle>;
  onChange: (formData: Partial<Vehicle>) => void;
  investors: Investor[];
  onGoToInvestors: () => void;
}

const InvestorSelector = ({ formData, onChange, investors, onGoToInvestors }: InvestorSelectorProps) => {
  return (
    <div className="space-y-2 col-span-2">
      <Label htmlFor="investor">Inversor</Label>
      <Select 
        value={formData.investor || ""} 
        onValueChange={(value) => onChange({ ...formData, investor: value })}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un inversor" />
        </SelectTrigger>
        <SelectContent>
          {investors.map((investor) => (
            <SelectItem key={investor.id} value={investor.name}>
              {investor.name} - {investor.documentId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {investors.length === 0 && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-red-500">
            Debes agregar inversores antes de poder registrar un vehículo
          </p>
          <Button
            type="button"
            variant="link"
            className="text-sm p-0 h-auto"
            onClick={onGoToInvestors}
          >
            Agregar inversor
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvestorSelector;
