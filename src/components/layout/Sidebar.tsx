
import { Link } from "react-router-dom";
import { Car, Users, Calendar, DollarSign, Settings, Bell } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: Car, label: "Vehículos", path: "/vehicles" },
    { icon: Users, label: "Inversores", path: "/investors" },
    { icon: Calendar, label: "Calendario", path: "/calendar" },
    { icon: DollarSign, label: "Pagos", path: "/payments" },
    { icon: Settings, label: "Configuración", path: "/settings" },
  ];

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 px-3 py-4 flex flex-col animate-fade-in">
      <div className="mb-8 px-4">
        <h1 className="text-xl font-semibold text-gray-800">FlotaSabia</h1>
      </div>
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
