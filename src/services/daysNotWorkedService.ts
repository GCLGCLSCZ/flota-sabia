
import { supabase } from "@/lib/supabase";

/**
 * Servicio para manejar operaciones CRUD de días no trabajados
 */
export const daysNotWorkedService = {
  // Obtener todos los días no trabajados para un vehículo
  async getByVehicleId(vehicleId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('days_not_worked')
        .select('date')
        .eq('vehicle_id', vehicleId);
      
      if (error) {
        console.error("Error al obtener días no trabajados:", error);
        return [];
      }
      
      return data.map(item => item.date);
    } catch (err) {
      console.error("Error al obtener días no trabajados:", err);
      return [];
    }
  },

  // Actualizar todos los días no trabajados para un vehículo
  async updateDaysNotWorked(vehicleId: string, dates: string[]): Promise<boolean> {
    try {
      // 1. Eliminar todos los días existentes
      const { error: deleteError } = await supabase
        .from('days_not_worked')
        .delete()
        .eq('vehicle_id', vehicleId);
      
      if (deleteError) {
        console.error("Error al eliminar días no trabajados:", deleteError);
        return false;
      }
      
      // 2. Si hay nuevas fechas, insertarlas
      if (dates && dates.length > 0) {
        const dataToInsert = dates.map(date => ({
          vehicle_id: vehicleId,
          date: date
        }));
        
        const { error: insertError } = await supabase
          .from('days_not_worked')
          .insert(dataToInsert);
        
        if (insertError) {
          console.error("Error al insertar días no trabajados:", insertError);
          return false;
        }
      }
      
      console.log("Días no trabajados actualizados correctamente", {
        vehicleId,
        eliminados: "todos",
        nuevos: dates
      });
      
      return true;
    } catch (err) {
      console.error("Error al actualizar días no trabajados:", err);
      return false;
    }
  },
  
  // Eliminar un día específico
  async removeDay(vehicleId: string, date: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('days_not_worked')
        .delete()
        .eq('vehicle_id', vehicleId)
        .eq('date', date);
      
      if (error) {
        console.error("Error al eliminar día no trabajado:", error);
        return false;
      }
      
      console.log("Día no trabajado eliminado correctamente", { vehicleId, date });
      return true;
    } catch (err) {
      console.error("Error al eliminar día no trabajado:", err);
      return false;
    }
  }
};
