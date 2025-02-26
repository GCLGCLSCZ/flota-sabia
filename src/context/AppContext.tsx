
import { createContext, useContext, ReactNode } from "react";
import { Vehicle, Payment, Investor, Driver } from "@/types";
import { STORAGE_KEYS } from "./storage";
import { validateVehicleData, validateInvestorData, validateDriverData } from "./validators";
import { useCRUD } from "./hooks/useCRUD";

interface AppContextType {
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  investors: Investor[];
  setInvestors: (investors: Investor[]) => void;
  drivers: Driver[];
  setDrivers: (drivers: Driver[]) => void;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => boolean;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  addPayment: (payment: Omit<Payment, "id">) => boolean;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  addInvestor: (investor: Omit<Investor, "id">) => boolean;
  updateInvestor: (id: string, investor: Partial<Investor>) => void;
  addDriver: (driver: Omit<Driver, "id">) => boolean;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  validateVehicleData: (vehicle: Partial<Vehicle>) => { isValid: boolean; errors: string[] };
  validateInvestorData: (investor: Partial<Investor>) => { isValid: boolean; errors: string[] };
  validateDriverData: (driver: Partial<Driver>) => { isValid: boolean; errors: string[] };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    items: vehicles,
    setItems: setVehicles,
    add: addVehicle,
    update: updateVehicle
  } = useCRUD<Vehicle>({
    storageKey: STORAGE_KEYS.VEHICLES,
    validator: validateVehicleData
  });

  const {
    items: payments,
    setItems: setPayments,
    add: addPayment,
    update: updatePayment
  } = useCRUD<Payment>({
    storageKey: STORAGE_KEYS.PAYMENTS
  });

  const {
    items: investors,
    setItems: setInvestors,
    add: addInvestor,
    update: updateInvestor
  } = useCRUD<Investor>({
    storageKey: STORAGE_KEYS.INVESTORS,
    validator: validateInvestorData
  });

  const {
    items: drivers,
    setItems: setDrivers,
    add: addDriver,
    update: updateDriver
  } = useCRUD<Driver>({
    storageKey: STORAGE_KEYS.DRIVERS,
    validator: validateDriverData
  });

  return (
    <AppContext.Provider
      value={{
        vehicles,
        setVehicles,
        payments,
        setPayments,
        investors,
        setInvestors,
        drivers,
        setDrivers,
        addVehicle,
        updateVehicle,
        addPayment,
        updatePayment,
        addInvestor,
        updateInvestor,
        addDriver,
        updateDriver,
        validateVehicleData,
        validateInvestorData,
        validateDriverData,
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
