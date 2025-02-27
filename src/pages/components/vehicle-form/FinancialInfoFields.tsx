
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/types";

interface FinancialInfoFieldsProps {
  formData: Partial<Vehicle>;
  onChange: (formData: Partial<Vehicle>) => void;
}

const FinancialInfoFields = ({ formData, onChange }: FinancialInfoFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="dailyRate">Comisión por Administración (Bs)</Label>
        <Input
          id="dailyRate"
          type="number"
          value={formData.dailyRate || 0}
          onChange={(e) => onChange({ ...formData, dailyRate: Number(e.target.value) })}
          required
        />
        <p className="text-sm text-muted-foreground">
          Comisión diaria que se cobra por la administración del vehículo
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contractStartDate">Fecha de inicio del contrato</Label>
        <Input
          id="contractStartDate"
          type="date"
          value={formData.contractStartDate || ""}
          onChange={(e) => onChange({ ...formData, contractStartDate: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="totalInstallments">Número total de cuotas</Label>
        <Input
          id="totalInstallments"
          type="number"
          value={formData.totalInstallments || 0}
          onChange={(e) => onChange({ ...formData, totalInstallments: Number(e.target.value) })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="installmentAmount">Renta Diaria (Bs)</Label>
        <Input
          id="installmentAmount"
          type="number"
          value={formData.installmentAmount || 0}
          onChange={(e) => onChange({ ...formData, installmentAmount: Number(e.target.value) })}
          required
        />
        <p className="text-sm text-muted-foreground">
          Monto diario que debe pagar el conductor por el vehículo
        </p>
      </div>
    </>
  );
};

export default FinancialInfoFields;
