
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

export const NotificationSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="maintenance">Mantenimientos Programados</Label>
            <p className="text-sm text-muted-foreground">
              Recibe alertas sobre mantenimientos próximos
            </p>
          </div>
          <Switch id="maintenance" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="payments">Pagos Pendientes</Label>
            <p className="text-sm text-muted-foreground">
              Notificaciones sobre pagos próximos o atrasados
            </p>
          </div>
          <Switch id="payments" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="drivers">Alertas de Choferes</Label>
            <p className="text-sm text-muted-foreground">
              Avisos sobre documentación próxima a vencer
            </p>
          </div>
          <Switch id="drivers" />
        </div>
      </CardContent>
    </Card>
  );
};
