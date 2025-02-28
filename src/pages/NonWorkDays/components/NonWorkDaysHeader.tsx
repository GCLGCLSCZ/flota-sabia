
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, CalendarOff, Search } from "lucide-react";

interface NonWorkDaysHeaderProps {
  onAddClick: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const NonWorkDaysHeader = ({ 
  onAddClick, 
  searchTerm, 
  onSearchChange 
}: NonWorkDaysHeaderProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">Días No Trabajados</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Registra los días en que los vehículos no operaron.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <Button onClick={onAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Día
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por placa, marca, modelo o conductor..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
