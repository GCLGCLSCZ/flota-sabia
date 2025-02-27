
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const ProfileSettings = () => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Perfil de Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo</Label>
          <Input id="name" placeholder="Tu nombre" defaultValue={user?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="tu@email.com" 
            defaultValue={user?.email} 
          />
        </div>
        <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">
            Rol: {user?.role === 'admin' ? 'Administrador' : 'Asistente'}
          </span>
        </div>
        <Button className="w-full">Guardar Cambios</Button>
      </CardContent>
    </Card>
  );
};
