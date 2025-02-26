
import { Vehicle } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VehicleStepProps {
  data: Partial<Vehicle>;
  onChange: (data: Partial<Vehicle>) => void;
}

export const VehicleStep = ({ data, onChange }: VehicleStepProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="plate">Placa</Label>
        <Input
          id="plate"
          value={data.plate || ""}
          onChange={(e) => onChange({ ...data, plate: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="brand">Marca</Label>
        <Input
          id="brand"
          value={data.brand || ""}
          onChange={(e) => onChange({ ...data, brand: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="model">Modelo</Label>
        <Input
          id="model"
          value={data.model || ""}
          onChange={(e) => onChange({ ...data, model: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="year">Año</Label>
        <Input
          id="year"
          value={data.year || ""}
          onChange={(e) => onChange({ ...data, year: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select
          value={data.status || "active"}
          onValueChange={(value: "active" | "maintenance" | "inactive") =>
            onChange({ ...data, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="maintenance">En Mantenimiento</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dailyRate">Tarifa Diaria (Bs)</Label>
        <Input
          id="dailyRate"
          type="number"
          value={data.dailyRate || ""}
          onChange={(e) =>
            onChange({ ...data, dailyRate: Number(e.target.value) })
          }
          required
        />
      </div>
    </div>
  );
};
