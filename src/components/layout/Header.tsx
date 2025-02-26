
import { Bell } from "lucide-react";

const Header = () => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Panel de Control</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
          <span className="text-sm font-medium">AS</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
