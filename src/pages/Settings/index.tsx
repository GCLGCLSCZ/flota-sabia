
import { Settings as SettingsIcon } from "lucide-react";
import { ProfileSettings } from "./components/ProfileSettings";
import { NotificationSettings } from "./components/NotificationSettings";
import { SystemSettings } from "./components/SystemSettings";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          Configuración
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestiona las configuraciones de tu cuenta y del sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <ProfileSettings />
          <SystemSettings />
        </div>
        <div>
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
};

export default Settings;
