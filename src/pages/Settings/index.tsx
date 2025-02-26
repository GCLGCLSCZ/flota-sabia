
import { ProfileSettings } from "./components/ProfileSettings";
import { NotificationSettings } from "./components/NotificationSettings";

const Settings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Configuración</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileSettings />
        <NotificationSettings />
      </div>
    </div>
  );
};

export default Settings;
