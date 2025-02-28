
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
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, UserCog } from "lucide-react";

export function ProfileSettings() {
  const { toast } = useToast();
  const [name, setName] = useState("Usuario Administrador");
  const [email, setEmail] = useState("admin@example.com");
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = () => {
    setLoading(true);
    
    // Simulamos una operación asíncrona
    setTimeout(() => {
      setLoading(false);
      
      toast({
        title: "Perfil actualizado",
        description: "La información de tu perfil ha sido actualizada correctamente.",
      });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Actualiza tu información de perfil y preferencias de cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
            <div className="mt-2">
              <Button variant="outline" size="sm">
                Cambiar avatar
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Input id="role" value="Administrador" disabled />
            <p className="text-sm text-muted-foreground">
              Tu rol determina los permisos que tienes en el sistema.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveProfile} disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </CardFooter>
    </Card>
  );
}
