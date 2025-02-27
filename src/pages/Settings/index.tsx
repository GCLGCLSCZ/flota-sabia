
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "./components/ProfileSettings";
import { NotificationSettings } from "./components/NotificationSettings";
import { SystemSettings } from "./components/SystemSettings";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Administra las configuraciones de tu cuenta y del sistema.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="profile" className="flex-1">
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1">
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="system" className="flex-1">
            Sistema
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="system" className="mt-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
