
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [vehicleAlerts, setVehicleAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  
  const handleSaveNotifications = () => {
    setLoading(true);
    
    // Simulamos una operación asíncrona
    setTimeout(() => {
      setLoading(false);
      
      toast({
        title: "Preferencias guardadas",
        description: "Tus preferencias de notificación han sido actualizadas.",
      });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones</CardTitle>
        <CardDescription>
          Configura cómo y cuándo deseas recibir notificaciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Canales de notificación</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Correo electrónico</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones por correo electrónico
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones por mensajes de texto
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Tipo de alertas</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payment-alerts">Alertas de pagos</Label>
                <p className="text-sm text-muted-foreground">
                  Notificaciones sobre pagos nuevos o atrasados
                </p>
              </div>
              <Switch
                id="payment-alerts"
                checked={paymentAlerts}
                onCheckedChange={setPaymentAlerts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-alerts">Alertas de mantenimiento</Label>
                <p className="text-sm text-muted-foreground">
                  Notificaciones sobre mantenimientos programados o atrasados
                </p>
              </div>
              <Switch
                id="maintenance-alerts"
                checked={maintenanceAlerts}
                onCheckedChange={setMaintenanceAlerts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vehicle-alerts">Alertas de vehículos</Label>
                <p className="text-sm text-muted-foreground">
                  Notificaciones sobre cambios de estado de vehículos
                </p>
              </div>
              <Switch
                id="vehicle-alerts"
                checked={vehicleAlerts}
                onCheckedChange={setVehicleAlerts}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Informes periódicos</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Informes semanales</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe un resumen semanal de la actividad de tu flota
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={weeklyReports}
                onCheckedChange={setWeeklyReports}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveNotifications} disabled={loading}>
          {loading ? "Guardando..." : "Guardar preferencias"}
        </Button>
      </CardFooter>
    </Card>
  );
}
