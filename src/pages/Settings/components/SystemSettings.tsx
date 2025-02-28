
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";

export function SystemSettings() {
  const { toast } = useToast();
  const { settings, updateSettings } = useApp();
  const [loading, setLoading] = useState(false);
  
  // System settings values with fallbacks
  const [gpsMonthlyFee, setGpsMonthlyFee] = useState(settings?.gpsMonthlyFee || 120);
  const [currency, setCurrency] = useState(settings?.currency || "bs");
  const [dateFormat, setDateFormat] = useState(settings?.dateFormat || "dd/MM/yyyy");
  const [timezone, setTimezone] = useState(settings?.timezone || "la_paz");
  
  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      await updateSettings({
        gpsMonthlyFee,
        currency,
        dateFormat,
        timezone
      });
      
      toast({
        title: "Configuración guardada",
        description: "La configuración del sistema ha sido actualizada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del Sistema</CardTitle>
        <CardDescription>
          Ajusta la configuración general del sistema de gestión de flota.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gps-fee">Tarifa mensual de GPS (Bs)</Label>
              <Input
                id="gps-fee"
                type="number"
                value={gpsMonthlyFee}
                onChange={(e) => setGpsMonthlyFee(Number(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                Tarifa que se descuenta automáticamente por el servicio de GPS.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Selecciona moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bs">Bolivianos (Bs)</SelectItem>
                  <SelectItem value="usd">Dólares (USD)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Moneda principal utilizada en el sistema.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date-format">Formato de fecha</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="date-format">
                  <SelectValue placeholder="Selecciona formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Formato para mostrar fechas en el sistema.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Selecciona zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="la_paz">La Paz (GMT-4)</SelectItem>
                  <SelectItem value="santa_cruz">Santa Cruz (GMT-4)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Zona horaria para cálculos y reportes.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Copia de seguridad</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline">Exportar datos</Button>
              <Button variant="outline">Importar copia de seguridad</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Realiza copias de seguridad periódicas para proteger tus datos.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? "Guardando..." : "Guardar configuración"}
        </Button>
      </CardFooter>
    </Card>
  );
}
