
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const NotificationSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones</CardTitle>
        <CardDescription>
          Configura tus preferencias de notificaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="maintenance-notifications">Mantenimientos Programados</Label>
          <Switch id="maintenance-notifications" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="payment-notifications">Pagos Pendientes</Label>
          <Switch id="payment-notifications" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="driver-notifications">Alertas de Choferes</Label>
          <Switch id="driver-notifications" />
        </div>
      </CardContent>
    </Card>
  );
};
