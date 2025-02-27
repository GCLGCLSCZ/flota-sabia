
import { Bell, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Cargar el tema desde localStorage al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Cambiar entre temas claro y oscuro
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    
    toast({
      title: `Tema ${newTheme === "light" ? "claro" : "oscuro"} activado`,
      description: "El cambio de tema se ha aplicado correctamente.",
    });
  };

  // Navegar al dashboard
  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 flex items-center justify-between animate-fade-in transition-colors">
      <div>
        <h2 
          onClick={navigateToDashboard}
          className="text-lg font-semibold text-gray-800 dark:text-white cursor-pointer hover:text-primary transition-colors"
        >
          Panel de Control
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full"
          aria-label={theme === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </Button>
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-primary text-white dark:bg-gray-700 flex items-center justify-center">
          <span className="text-sm font-medium">AS</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
