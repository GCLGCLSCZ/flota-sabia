
import { createContext, useContext, useState, ReactNode } from "react";
import { Vehicle, Payment, Investor, Driver } from "@/types";

interface AppContextType {
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  investors: Investor[];
  setInvestors: (investors: Investor[]) => void;
  drivers: Driver[];
  setDrivers: (drivers: Driver[]) => void;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  addPayment: (payment: Omit<Payment, "id">) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  addInvestor: (investor: Omit<Investor, "id">) => void;
  updateInvestor: (id: string, investor: Partial<Investor>) => void;
  addDriver: (driver: Omit<Driver, "id">) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const addVehicle = (vehicleData: Omit<Vehicle, "id">) => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      ...vehicleData,
    };
    setVehicles([...vehicles, newVehicle]);

    // Actualizar el contador de vehículos del inversor
    if (vehicleData.investor) {
      setInvestors(prevInvestors =>
        prevInvestors.map(inv =>
          inv.name === vehicleData.investor
            ? { ...inv, vehicleCount: (inv.vehicleCount || 0) + 1 }
            : inv
        )
      );
    }

    // Actualizar el chofer si está asignado
    if (vehicleData.driverId) {
      setDrivers(prevDrivers =>
        prevDrivers.map(driver =>
          driver.id === vehicleData.driverId
            ? { ...driver, vehicleId: newVehicle.id }
            : driver
        )
      );
    }
  };

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles(prevVehicles =>
      prevVehicles.map(vehicle =>
        vehicle.id === id ? { ...vehicle, ...vehicleData } : vehicle
      )
    );
  };

  const addPayment = (paymentData: Omit<Payment, "id">) => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      ...paymentData,
    };
    setPayments([...payments, newPayment]);

    // Actualizar el último pago del vehículo y del inversor
    const vehicle = vehicles.find(v => v.id === paymentData.vehicleId);
    if (vehicle) {
      const investor = investors.find(i => i.name === vehicle.investor);
      if (investor) {
        updateInvestor(investor.id, {
          lastPayment: paymentData.date.toISOString().split('T')[0],
        });
      }
    }
  };

  const updatePayment = (id: string, paymentData: Partial<Payment>) => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === id ? { ...payment, ...paymentData } : payment
      )
    );
  };

  const addInvestor = (investorData: Omit<Investor, "id">) => {
    const newInvestor: Investor = {
      id: Date.now().toString(),
      ...investorData,
      vehicleCount: 0,
    };
    setInvestors([...investors, newInvestor]);
  };

  const updateInvestor = (id: string, investorData: Partial<Investor>) => {
    setInvestors(prevInvestors =>
      prevInvestors.map(investor =>
        investor.id === id ? { ...investor, ...investorData } : investor
      )
    );
  };

  const addDriver = (driverData: Omit<Driver, "id">) => {
    const newDriver: Driver = {
      id: Date.now().toString(),
      ...driverData,
      status: "active",
    };
    setDrivers([...drivers, newDriver]);
  };

  const updateDriver = (id: string, driverData: Partial<Driver>) => {
    setDrivers(prevDrivers =>
      prevDrivers.map(driver =>
        driver.id === id ? { ...driver, ...driverData } : driver
      )
    );
  };

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
