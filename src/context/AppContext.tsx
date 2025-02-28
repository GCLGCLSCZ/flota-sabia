
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
  
  // Flag para determinar si usamos Supabase
  const useSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL);

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

  // Para días no trabajados
  const [daysNotWorked, setDaysNotWorked] = useState<{id: string, vehicleId: string, date: string}[]>([]);

  // Cargar días no trabajados
  useEffect(() => {
    if (useSupabase) {
      const fetchDaysNotWorked = async () => {
        const { data, error } = await supabase
          .from('days_not_worked')
          .select('*');
        
        if (!error && data) {
          setDaysNotWorked(data);
        }
      };
      
      fetchDaysNotWorked();
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
      
      // Asignar días no trabajados
      const vehicleDaysNotWorked = daysNotWorked
        .filter(d => d.vehicleId === vehicle.id)
        .map(d => d.date);
      
      return {
        ...vehicle,
        maintenanceHistory: vehicleMaintenance,
        cardex: vehicleCardex,
        discounts: vehicleDiscounts,
        daysNotWorked: vehicleDaysNotWorked
      };
    });

    setFullVehicles(enhancedVehicles);
  }, [
    useSupabase, 
    vehicles, 
    maintenanceItems, 
    cardexItems, 
    discountItems, 
    daysNotWorked,
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

    // Extraer datos relacionados
    const { maintenanceHistory, cardex, discounts, daysNotWorked, ...baseVehicleData } = vehicleData;
    
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
        
        // Agregar días no trabajados si existen
        if (daysNotWorked && daysNotWorked.length > 0) {
          for (const date of daysNotWorked) {
            await supabase.from('days_not_worked').insert({
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
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    if (!useSupabase) {
      return updateVehicleBase(id, vehicleData);
    }

    // Extraer datos relacionados
    const { maintenanceHistory, cardex, discounts, daysNotWorked, ...baseVehicleData } = vehicleData;
    
    // Actualizar el vehículo base
    const success = await updateVehicleBase(id, baseVehicleData);
    
    if (success) {
      // Actualizar mantenimientos si se proporcionaron
      if (maintenanceHistory) {
        // Primero eliminamos los existentes para evitar duplicados
        await supabase.from('maintenance').delete().eq('vehicle_id', id);
        
        // Luego agregamos los nuevos
        for (const maintenance of maintenanceHistory) {
          const maintenanceData = {
            ...maintenance,
            vehicleId: id
          };
          await supabase.from('maintenance').insert(maintenanceToDb(maintenanceData));
        }
      }
      
      // Actualizar cardex si se proporcionó
      if (cardex) {
        // Primero eliminamos los existentes
        await supabase.from('cardex').delete().eq('vehicle_id', id);
        
        // Luego agregamos los nuevos
        for (const item of cardex) {
          const cardexData = {
            ...item,
            vehicleId: id
          };
          await supabase.from('cardex').insert(cardexToDb(cardexData));
        }
      }
      
      // Actualizar descuentos si se proporcionaron
      if (discounts) {
        // Primero eliminamos los existentes
        await supabase.from('discounts').delete().eq('vehicle_id', id);
        
        // Luego agregamos los nuevos
        for (const discount of discounts) {
          const discountData = {
            ...discount,
            vehicleId: id
          };
          await supabase.from('discounts').insert(discountToDb(discountData));
        }
      }
      
      // Actualizar días no trabajados si se proporcionaron
      if (daysNotWorked) {
        // Primero eliminamos los existentes
        await supabase.from('days_not_worked').delete().eq('vehicle_id', id);
        
        // Luego agregamos los nuevos
        for (const date of daysNotWorked) {
          await supabase.from('days_not_worked').insert({
            vehicle_id: id,
            date
          });
        }
      }
      
      // Refrescar datos
      await refreshData();
    }
    
    return success;
  };

  // Refrescar todos los datos
  const refreshData = async () => {
    setLoading(true);
    
    if (useSupabase) {
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
          const { data } = await supabase.from('days_not_worked').select('*');
          if (data) setDaysNotWorked(data);
        })()
      ]);
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
        refreshData
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
