
import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { Vehicle, Payment, Investor, Driver, SystemSettings, Maintenance, CardexItem, Discount } from "@/types";
import { STORAGE_KEYS } from "./storage";
import { validateVehicleData, validateInvestorData, validateDriverData } from "./validators";
import { useCRUD } from "./hooks/useCRUD";
import { 
  vehicleToDb, vehicleFromDb, 
  paymentToDb, paymentFromDb, 
  investorToDb, investorFromDb, 
  driverToDb, driverFromDb, 
  settingsToDb, settingsFromDb,
  maintenanceToDb, maintenanceFromDb,
  cardexToDb, cardexFromDb,
  discountToDb, discountFromDb
} from "@/lib/transformers";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  investors: Investor[];
  setInvestors: (investors: Investor[]) => void;
  drivers: Driver[];
  setDrivers: (drivers: Driver[]) => void;
  settings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<boolean>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<boolean>;
  addPayment: (payment: Omit<Payment, "id">) => Promise<boolean>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<boolean>;
  removePayment: (id: string) => Promise<boolean>;
  addInvestor: (investor: Omit<Investor, "id">) => Promise<boolean>;
  updateInvestor: (id: string, investor: Partial<Investor>) => Promise<boolean>;
  addDriver: (driver: Omit<Driver, "id">) => Promise<boolean>;
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<boolean>;
  validateVehicleData: (vehicle: Partial<Vehicle>) => { isValid: boolean; errors: string[] };
  validateInvestorData: (investor: Partial<Investor>) => { isValid: boolean; errors: string[] };
  validateDriverData: (driver: Partial<Driver>) => { isValid: boolean; errors: string[] };
  loading: boolean;
  refreshData: () => Promise<void>;
  addFreeDay: (vehicleId: string, date: string) => Promise<boolean>;
  removeFreeDay: (vehicleId: string, date: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Definir la configuración por defecto del sistema
const DEFAULT_SETTINGS: Omit<SystemSettings, "id"> = {
  gpsMonthlyFee: 120,
  currency: "bs",
  dateFormat: "dd/MM/yyyy",
  timezone: "la_paz"
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [fullVehicles, setFullVehicles] = useState<Vehicle[]>([]);
  const { toast } = useToast();
  
  // Flag para determinar si usamos Supabase - verificamos que el cliente existe
  const useSupabase = Boolean(supabase);

  const {
    items: vehicles,
    setItems: setVehicles,
    add: addVehicleBase,
    update: updateVehicleBase,
    loading: vehiclesLoading,
    refresh: refreshVehicles
  } = useCRUD<Vehicle>({
    storageKey: STORAGE_KEYS.VEHICLES,
    tableName: 'vehicles',
    validator: validateVehicleData,
    useSupabase,
    transformToDb: vehicleToDb,
    transformFromDb: vehicleFromDb
  });

  const {
    items: payments,
    setItems: setPayments,
    add: addPaymentBase,
    update: updatePaymentBase,
    remove: removePaymentBase,
    loading: paymentsLoading,
    refresh: refreshPayments
  } = useCRUD<Payment>({
    storageKey: STORAGE_KEYS.PAYMENTS,
    tableName: 'payments',
    useSupabase,
    transformToDb: paymentToDb,
    transformFromDb: paymentFromDb
  });

  const {
    items: investors,
    setItems: setInvestors,
    add: addInvestorBase,
    update: updateInvestorBase,
    loading: investorsLoading,
    refresh: refreshInvestors
  } = useCRUD<Investor>({
    storageKey: STORAGE_KEYS.INVESTORS,
    tableName: 'investors',
    validator: validateInvestorData,
    useSupabase,
    transformToDb: investorToDb,
    transformFromDb: investorFromDb
  });

  const {
    items: drivers,
    setItems: setDrivers,
    add: addDriverBase,
    update: updateDriverBase,
    loading: driversLoading,
    refresh: refreshDrivers
  } = useCRUD<Driver>({
    storageKey: STORAGE_KEYS.DRIVERS,
    tableName: 'drivers',
    validator: validateDriverData,
    useSupabase,
    transformToDb: driverToDb,
    transformFromDb: driverFromDb
  });

  // Gestión de la configuración del sistema
  const {
    items: settingsArray,
    setItems: setSettingsArray,
    add: addSettingsBase,
    update: updateSettingsBase,
    loading: settingsLoading,
    refresh: refreshSettings
  } = useCRUD<SystemSettings>({
    storageKey: 'settings',
    tableName: 'settings',
    useSupabase,
    transformToDb: settingsToDb,
    transformFromDb: settingsFromDb
  });

  // Asegurarse de que siempre haya una configuración disponible
  const settings = settingsArray.length > 0 ? settingsArray[0] : {
    id: 'default-settings',
    ...DEFAULT_SETTINGS
  };

  // Para mantenimientos
  const {
    items: maintenanceItems,
    loading: maintenanceLoading,
    refresh: refreshMaintenance
  } = useCRUD<Maintenance>({
    storageKey: 'maintenance',
    tableName: 'maintenance',
    useSupabase,
    transformToDb: maintenanceToDb,
    transformFromDb: maintenanceFromDb
  });

  // Para cardex
  const {
    items: cardexItems,
    loading: cardexLoading,
    refresh: refreshCardex
  } = useCRUD<CardexItem>({
    storageKey: 'cardex',
    tableName: 'cardex',
    useSupabase,
    transformToDb: cardexToDb,
    transformFromDb: cardexFromDb
  });

  // Para descuentos
  const {
    items: discountItems,
    loading: discountsLoading,
    refresh: refreshDiscounts
  } = useCRUD<Discount>({
    storageKey: 'discounts',
    tableName: 'discounts',
    useSupabase,
    transformToDb: discountToDb,
    transformFromDb: discountFromDb
  });

  // Para días libres
  const [freeDays, setFreeDays] = useState<{id: string, vehicleId: string, date: string}[]>([]);

  // Cargar días libres
  useEffect(() => {
    if (useSupabase) {
      const fetchFreeDays = async () => {
        try {
          const { data, error } = await supabase
            .from('free_days')
            .select('*');
          
          if (!error && data) {
            setFreeDays(data);
          }
        } catch (err) {
          console.error("Error fetching free days:", err);
        }
      };
      
      fetchFreeDays();
    }
  }, [useSupabase]);

  // Combinar datos relacionados con vehículos
  useEffect(() => {
    if (!useSupabase) {
      setFullVehicles(vehicles);
      return;
    }

    // Solo proceder si todos los datos necesarios están cargados
    if (vehiclesLoading || maintenanceLoading || cardexLoading || discountsLoading) {
      return;
    }

    const enhancedVehicles = vehicles.map(vehicle => {
      // Asignar mantenimientos
      const vehicleMaintenance = maintenanceItems
        .filter(m => m.vehicleId === vehicle.id)
        .map(m => ({ ...m }));
      
      // Asignar cardex
      const vehicleCardex = cardexItems
        .filter(c => c.vehicleId === vehicle.id)
        .map(c => ({ ...c }));
      
      // Asignar descuentos
      const vehicleDiscounts = discountItems
        .filter(d => d.vehicleId === vehicle.id)
        .map(d => ({ ...d }));
      
      // Asignar días libres
      const vehicleFreeDays = freeDays
        .filter(d => d.vehicleId === vehicle.id)
        .map(d => d.date);
      
      return {
        ...vehicle,
        maintenanceHistory: vehicleMaintenance,
        cardex: vehicleCardex,
        discounts: vehicleDiscounts,
        freeDays: vehicleFreeDays
      };
    });

    setFullVehicles(enhancedVehicles);
  }, [
    useSupabase, 
    vehicles, 
    maintenanceItems, 
    cardexItems, 
    discountItems, 
    freeDays,
    vehiclesLoading,
    maintenanceLoading,
    cardexLoading,
    discountsLoading
  ]);

  // Función para actualizar la configuración
  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    if (settingsArray.length > 0) {
      await updateSettingsBase(settings.id, newSettings);
      setSettingsArray([updatedSettings]);
    } else {
      await addSettingsBase({
        id: 'default-settings',
        ...DEFAULT_SETTINGS,
        ...newSettings
      } as SystemSettings);
    }
  };

  // Funciones para agregar o actualizar vehículos con relaciones
  const addVehicle = async (vehicleData: Omit<Vehicle, "id">) => {
    if (!useSupabase) {
      return addVehicleBase(vehicleData);
    }

    try {
      // Extraer datos relacionados
      const { maintenanceHistory, cardex, discounts, freeDays, ...baseVehicleData } = vehicleData;
      
      // Primero agregar el vehículo base
      const success = await addVehicleBase(baseVehicleData);
      
      if (success) {
        // Buscar el ID del vehículo recién agregado
        const { data } = await supabase
          .from('vehicles')
          .select('id')
          .eq('plate', baseVehicleData.plate)
          .single();
        
        if (data?.id) {
          const vehicleId = data.id;
          
          // Agregar mantenimientos si existen
          if (maintenanceHistory && maintenanceHistory.length > 0) {
            for (const maintenance of maintenanceHistory) {
              const maintenanceData = {
                ...maintenance,
                vehicleId
              };
              await supabase.from('maintenance').insert(maintenanceToDb(maintenanceData));
            }
          }
          
          // Agregar cardex si existe
          if (cardex && cardex.length > 0) {
            for (const item of cardex) {
              const cardexData = {
                ...item,
                vehicleId
              };
              await supabase.from('cardex').insert(cardexToDb(cardexData));
            }
          }
          
          // Agregar descuentos si existen
          if (discounts && discounts.length > 0) {
            for (const discount of discounts) {
              const discountData = {
                ...discount,
                vehicleId
              };
              await supabase.from('discounts').insert(discountToDb(discountData));
            }
          }
          
          // Agregar días libres si existen
          if (freeDays && freeDays.length > 0) {
            for (const date of freeDays) {
              await supabase.from('free_days').insert({
                vehicle_id: vehicleId,
                date
              });
            }
          }
          
          // Refrescar datos
          await refreshData();
        }
      }
      
      return success;
    } catch (err) {
      console.error("Error adding vehicle with relationships:", err);
      return false;
    }
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    if (!useSupabase) {
      // Para almacenamiento local, sólo actualizamos el vehículo en el estado
      const result = await updateVehicleBase(id, vehicleData);
      
      // Si estamos actualizando freeDays, también actualizamos los vehículos completos
      if (vehicleData.freeDays !== undefined) {
        setFullVehicles((prevVehicles) =>
          prevVehicles.map((vehicle) =>
            vehicle.id === id
              ? { ...vehicle, freeDays: vehicleData.freeDays || [] }
              : vehicle
          )
        );
      }
      
      return result;
    }

    try {
      // Extraer datos relacionados
      const { maintenanceHistory, cardex, discounts, freeDays, ...baseVehicleData } = vehicleData;
      
      // Actualizar el vehículo base
      const success = await updateVehicleBase(id, baseVehicleData);
      
      if (success) {
        // Actualizar mantenimientos si se proporcionaron
        if (maintenanceHistory !== undefined) {
          // Primero eliminamos los existentes para evitar duplicados
          await supabase.from('maintenance').delete().eq('vehicle_id', id);
          
          // Luego agregamos los nuevos
          if (maintenanceHistory.length > 0) {
            for (const maintenance of maintenanceHistory) {
              const maintenanceData = {
                ...maintenance,
                vehicleId: id
              };
              await supabase.from('maintenance').insert(maintenanceToDb(maintenanceData));
            }
          }
        }
        
        // Actualizar cardex si se proporcionó
        if (cardex !== undefined) {
          // Primero eliminamos los existentes
          await supabase.from('cardex').delete().eq('vehicle_id', id);
          
          // Luego agregamos los nuevos
          if (cardex.length > 0) {
            for (const item of cardex) {
              const cardexData = {
                ...item,
                vehicleId: id
              };
              await supabase.from('cardex').insert(cardexToDb(cardexData));
            }
          }
        }
        
        // Actualizar descuentos si se proporcionaron
        if (discounts !== undefined) {
          // Primero eliminamos los existentes
          await supabase.from('discounts').delete().eq('vehicle_id', id);
          
          // Luego agregamos los nuevos
          if (discounts.length > 0) {
            for (const discount of discounts) {
              const discountData = {
                ...discount,
                vehicleId: id
              };
              await supabase.from('discounts').insert(discountToDb(discountData));
            }
          }
        }
        
        // Actualizar días libres si se proporcionaron
        if (freeDays !== undefined) {
          // Primero eliminamos los existentes
          await supabase.from('free_days').delete().eq('vehicle_id', id);
          
          // Luego agregamos los nuevos
          if (freeDays.length > 0) {
            for (const date of freeDays) {
              await supabase.from('free_days').insert({
                vehicle_id: id,
                date
              });
            }
          }
          
          // Actualizar el estado local con los nuevos días
          setFreeDays(prev => {
            // Eliminar los días anteriores para este vehículo
            const filtered = prev.filter(item => item.vehicleId !== id);
            // Añadir los nuevos días
            const newDays = freeDays.map(date => ({
              id: `${id}-${date}`,
              vehicleId: id,
              date
            }));
            return [...filtered, ...newDays];
          });
          
          // Actualizar los vehículos completos con los nuevos días
          setFullVehicles(prev => 
            prev.map(vehicle => 
              vehicle.id === id
                ? { ...vehicle, freeDays }
                : vehicle
            )
          );
        }
        
        // Refrescar datos solo si es necesario
        if (maintenanceHistory !== undefined || cardex !== undefined || discounts !== undefined) {
          await refreshData();
        }
      }
      
      return success;
    } catch (err) {
      console.error("Error updating vehicle with relationships:", err);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el vehículo: " + (err instanceof Error ? err.message : String(err)),
        variant: "destructive"
      });
      return false;
    }
  };

  // Añadir un día libre específico para un vehículo
  const addFreeDay = async (vehicleId: string, date: string) => {
    try {
      // Buscar el vehículo
      const vehicle = fullVehicles.find(v => v.id === vehicleId);
      
      if (!vehicle) {
        console.error("Vehículo no encontrado:", vehicleId);
        return false;
      }
      
      // Verificar si el día ya existe
      const currentDays = vehicle.freeDays || [];
      if (currentDays.includes(date)) {
        console.log("Este día ya está registrado como jornada libre:", date);
        return false;
      }
      
      // Actualizar el vehículo con el nuevo día
      const updatedDays = [...currentDays, date];
      
      // Actualizar vehículo con la función normal
      return await updateVehicle(vehicleId, { freeDays: updatedDays });
      
    } catch (err) {
      console.error("Error al añadir día libre:", err);
      toast({
        title: "Error",
        description: "No se pudo agregar la jornada libre",
        variant: "destructive"
      });
      return false;
    }
  };

  // Eliminar un día libre específico para un vehículo
  const removeFreeDay = async (vehicleId: string, date: string) => {
    try {
      // Buscar el vehículo
      const vehicle = fullVehicles.find(v => v.id === vehicleId);
      
      if (!vehicle) {
        console.error("Vehículo no encontrado:", vehicleId);
        return false;
      }
      
      // Verificar si el día existe
      const currentDays = vehicle.freeDays || [];
      if (!currentDays.includes(date)) {
        console.log("Este día no está registrado como jornada libre:", date);
        return false;
      }
      
      // Filtrar para eliminar el día
      const updatedDays = currentDays.filter(d => d !== date);
      
      // Actualizar vehículo con la función normal
      return await updateVehicle(vehicleId, { freeDays: updatedDays });
      
    } catch (err) {
      console.error("Error al eliminar día libre:", err);
      toast({
        title: "Error",
        description: "No se pudo eliminar la jornada libre",
        variant: "destructive"
      });
      return false;
    }
  };

  // Refrescar todos los datos
  const refreshData = async () => {
    setLoading(true);
    
    if (useSupabase) {
      try {
        await Promise.all([
          refreshVehicles(),
          refreshPayments(),
          refreshInvestors(),
          refreshDrivers(),
          refreshSettings(),
          refreshMaintenance(),
          refreshCardex(),
          refreshDiscounts(),
          (async () => {
            const { data } = await supabase.from('free_days').select('*');
            if (data) setFreeDays(data);
          })()
        ]);
      } catch (err) {
        console.error("Error refreshing data:", err);
      }
    }
    
    setLoading(false);
  };

  // Verificar loading general
  useEffect(() => {
    setLoading(
      vehiclesLoading || 
      paymentsLoading || 
      investorsLoading || 
      driversLoading || 
      settingsLoading ||
      maintenanceLoading ||
      cardexLoading ||
      discountsLoading
    );
  }, [
    vehiclesLoading,
    paymentsLoading,
    investorsLoading,
    driversLoading,
    settingsLoading,
    maintenanceLoading,
    cardexLoading,
    discountsLoading
  ]);

  // Refrescar datos al inicio si usamos Supabase
  useEffect(() => {
    if (useSupabase) {
      refreshData();
    }
  }, [useSupabase]);

  return (
    <AppContext.Provider
      value={{
        vehicles: fullVehicles,
        setVehicles: setFullVehicles,
        payments,
        setPayments,
        investors,
        setInvestors,
        drivers,
        setDrivers,
        settings,
        updateSettings,
        addVehicle,
        updateVehicle,
        addPayment: addPaymentBase,
        updatePayment: updatePaymentBase,
        removePayment: removePaymentBase,
        addInvestor: addInvestorBase,
        updateInvestor: updateInvestorBase,
        addDriver: addDriverBase,
        updateDriver: updateDriverBase,
        validateVehicleData,
        validateInvestorData,
        validateDriverData,
        loading,
        refreshData,
        addFreeDay,
        removeFreeDay
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
