
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const EventForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Evento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" placeholder="Nombre del evento" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select>
            <SelectTrigger id="type">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintenance">Mantenimiento</SelectItem>
              <SelectItem value="payment">Pago</SelectItem>
              <SelectItem value="driver">Chofer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" type="datetime-local" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Input id="description" placeholder="Descripción del evento" />
        </div>
        <Button className="w-full">Guardar Evento</Button>
      </CardContent>
    </Card>
  );
};
