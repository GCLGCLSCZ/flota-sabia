
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { NonWorkDaysHeader } from "./components/NonWorkDaysHeader";
import { NonWorkDaysList } from "./components/NonWorkDaysList";
import { NonWorkDaysCalendar } from "./components/NonWorkDaysCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle } from "@/types";
import AddNonWorkDayDialog from "./components/AddNonWorkDayDialog";

const NonWorkDaysPage = () => {
  const { vehicles, updateVehicle, refreshData } = useApp();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar vehículos según el término de búsqueda
  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.plate.toLowerCase().includes(searchLower) ||
      vehicle.brand.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.driverName?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddNonWorkDay = async (vehicleId: string, date: string) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) {
        toast({
          title: "Error",
          description: "Vehículo no encontrado",
          variant: "destructive",
        });
        return;
      }

      // Verificar si la fecha ya está registrada
      const existingDates = vehicle.daysNotWorked || [];
      if (existingDates.includes(date)) {
        toast({
          title: "Fecha duplicada",
          description: "Esta fecha ya está registrada como día no trabajado",
          variant: "destructive",
        });
        return;
      }

      // Añadir la nueva fecha
      const updatedDates = [...existingDates, date];
      
      // Actualizar el vehículo
      const success = await updateVehicle(vehicleId, {
        daysNotWorked: updatedDates,
      });

      if (success) {
        toast({
          title: "Día no trabajado registrado",
          description: "Se ha registrado correctamente el día no trabajado",
        });
        
        setShowAddDialog(false);
        refreshData();
      } else {
        toast({
          title: "Error",
          description: "No se pudo registrar el día no trabajado",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error al añadir día no trabajado:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleRemoveNonWorkDay = async (vehicleId: string, dateToRemove: string) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) {
        toast({
          title: "Error",
          description: "Vehículo no encontrado",
          variant: "destructive",
        });
        return;
      }

      // Filtrar la fecha a eliminar
      const existingDates = vehicle.daysNotWorked || [];
      const updatedDates = existingDates.filter(date => date !== dateToRemove);
      
      // Si no hay cambios, no hacer nada
      if (updatedDates.length === existingDates.length) {
        toast({
          title: "Información",
          description: "La fecha indicada no estaba registrada",
        });
        return;
      }

      // Actualizar el vehículo
      const success = await updateVehicle(vehicleId, {
        daysNotWorked: updatedDates,
      });

      if (success) {
        toast({
          title: "Día eliminado",
          description: "Se ha eliminado el día no trabajado correctamente",
        });
        
        refreshData();
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el día no trabajado",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error al eliminar día no trabajado:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la solicitud",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full py-3 space-y-4 custom-scrollbar">
      <NonWorkDaysHeader 
        onAddClick={() => setShowAddDialog(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <NonWorkDaysList 
            vehicles={filteredVehicles}
            onRemoveDay={handleRemoveNonWorkDay}
            onSelectVehicle={setSelectedVehicle}
          />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-4">
          <NonWorkDaysCalendar 
            vehicles={filteredVehicles}
            onAddDay={handleAddNonWorkDay}
            onRemoveDay={handleRemoveNonWorkDay}
          />
        </TabsContent>
      </Tabs>

      <AddNonWorkDayDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        vehicles={vehicles}
        onAddNonWorkDay={handleAddNonWorkDay}
        selectedVehicle={selectedVehicle}
      />
    </div>
  );
};

export default NonWorkDaysPage;
