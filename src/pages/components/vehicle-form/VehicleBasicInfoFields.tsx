
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/types";

interface VehicleBasicInfoFieldsProps {
  formData: Partial<Vehicle>;
  onChange: (formData: Partial<Vehicle>) => void;
}

const VehicleBasicInfoFields = ({ formData, onChange }: VehicleBasicInfoFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="plate">Placa</Label>
        <Input
          id="plate"
          value={formData.plate || ""}
          onChange={(e) => onChange({ ...formData, plate: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="brand">Marca</Label>
        <Input
          id="brand"
          value={formData.brand || ""}
          onChange={(e) => onChange({ ...formData, brand: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="model">Modelo</Label>
        <Input
          id="model"
          value={formData.model || ""}
          onChange={(e) => onChange({ ...formData, model: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="year">Año</Label>
        <Input
          id="year"
          value={formData.year || ""}
          onChange={(e) => onChange({ ...formData, year: e.target.value })}
          required
        />
      </div>
    </>
  );
};

export default VehicleBasicInfoFields;
