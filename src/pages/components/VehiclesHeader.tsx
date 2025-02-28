
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, DollarSign, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const VehiclesHeader = ({ onAddClick }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">Vehículos</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Gestiona tu flota de vehículos y conductores.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <Button onClick={onAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Vehículo
          </Button>
          <Button variant="outline" asChild>
            <Link to="/payments">
              <DollarSign className="mr-2 h-4 w-4" />
              Ir a Pagos
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por placa, marca o modelo..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};
