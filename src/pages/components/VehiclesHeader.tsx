
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";

interface VehiclesHeaderProps {
  onAddClick: () => void;
  onSearch?: (value: string) => void;
  onFilterChange?: (value: string) => void;
}

export const VehiclesHeader = ({ 
  onAddClick,
  onSearch = () => {}, 
  onFilterChange = () => {} 
}: VehiclesHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (value: string) => {
    onFilterChange(value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="text-3xl font-bold dark:text-white w-full md:w-auto">
        Vehículos
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-[250px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vehículo..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select onValueChange={handleFilterChange} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
              <SelectItem value="maintenance">En mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddClick} className="gap-1">
          <Plus className="h-5 w-5" />
          <span className="hidden md:inline">Agregar</span>
        </Button>
      </div>
    </div>
  );
};
