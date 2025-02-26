
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2, Database, CloudCog } from "lucide-react";

export const SystemSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          Configuración del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Moneda Principal</Label>
          <Select defaultValue="bs">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bs">Bolivianos (Bs)</SelectItem>
              <SelectItem value="usd">Dólares (USD)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Zona Horaria</Label>
          <Select defaultValue="la_paz">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="la_paz">La Paz (GMT-4)</SelectItem>
              <SelectItem value="santa_cruz">Santa Cruz (GMT-4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <Label>Respaldo de Datos</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Último respaldo: hace 3 días
              </p>
            </div>
            <Button variant="outline" size="sm">
              Respaldar Ahora
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <CloudCog className="w-4 h-4" />
                <Label>Sincronización</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Última sincronización: hace 5 minutos
              </p>
            </div>
            <Button variant="outline" size="sm">
              Sincronizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
