
import { createContext, useContext, useState, ReactNode } from "react";
import { Vehicle, Payment, Investor, Driver } from "@/types";
import { useToast } from "@/components/ui/use-toast";

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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const { toast } = useToast();

  // Funciones de validación
  const validateVehicleData = (vehicle: Partial<Vehicle>) => {
    const errors: string[] = [];

    if (!vehicle.plate) errors.push("La placa del vehículo es requerida");
    if (!vehicle.brand) errors.push("La marca del vehículo es requerida");
    if (!vehicle.model) errors.push("El modelo del vehículo es requerido");
    if (!vehicle.investor) errors.push("Debe asignar un inversor al vehículo");
    if (!vehicle.dailyRate) errors.push("La tarifa diaria es requerida");

    // Verificar si el inversor existe
    if (vehicle.investor && !investors.some(i => i.name === vehicle.investor)) {
      errors.push("El inversor especificado no existe en el sistema");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateInvestorData = (investor: Partial<Investor>) => {
    const errors: string[] = [];

    if (!investor.name) errors.push("El nombre del inversor es requerido");
    if (!investor.contact) errors.push("El contacto del inversor es requerido");
    if (!investor.documentId) errors.push("El documento de identidad es requerido");
    if (!investor.bankAccount) errors.push("La cuenta bancaria es requerida");

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateDriverData = (driver: Partial<Driver>) => {
    const errors: string[] = [];

    if (!driver.name) errors.push("El nombre del conductor es requerido");
    if (!driver.phone) errors.push("El teléfono del conductor es requerido");
    if (!driver.documentId) errors.push("El documento de identidad es requerido");
    if (!driver.licenseNumber) errors.push("El número de licencia es requerido");
    if (!driver.licenseExpiry) errors.push("La fecha de vencimiento de la licencia es requerida");

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Funciones de agregar/actualizar con validación
  const addVehicle = (vehicleData: Omit<Vehicle, "id">) => {
    const validation = validateVehicleData(vehicleData);
    
    if (!validation.isValid) {
      toast({
        title: "Error al agregar vehículo",
        description: validation.errors.join("\n"),
        variant: "destructive"
      });
      return false;
    }

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      ...vehicleData,
    };
    
    setVehicles(prev => [...prev, newVehicle]);

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

    toast({
      title: "Vehículo agregado",
      description: "El vehículo ha sido registrado exitosamente"
    });

    return true;
  };

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles(prevVehicles =>
      prevVehicles.map(vehicle =>
        vehicle.id === id ? { ...vehicle, ...vehicleData } : vehicle
      )
    );

    // Actualizar referencias en conductores si cambia el estado
    if (vehicleData.status === "inactive") {
      setDrivers(prevDrivers =>
        prevDrivers.map(driver =>
          driver.vehicleId === id ? { ...driver, vehicleId: undefined } : driver
        )
      );
    }

    toast({
      title: "Vehículo actualizado",
      description: "Los datos del vehículo han sido actualizados"
    });
  };

  const addPayment = (paymentData: Omit<Payment, "id">) => {
    // Validar que el vehículo existe
    const vehicle = vehicles.find(v => v.id === paymentData.vehicleId);
    if (!vehicle) {
      toast({
        title: "Error al registrar pago",
        description: "El vehículo especificado no existe",
        variant: "destructive"
      });
      return false;
    }

    const newPayment: Payment = {
      id: Date.now().toString(),
      ...paymentData,
    };
    
    setPayments(prev => [...prev, newPayment]);

    // Actualizar el último pago del vehículo y del inversor
    const investor = investors.find(i => i.name === vehicle.investor);
    if (investor) {
      updateInvestor(investor.id, {
        lastPayment: paymentData.date.toISOString().split('T')[0],
      });
    }

    toast({
      title: "Pago registrado",
      description: "El pago ha sido registrado exitosamente"
    });

    return true;
  };

  const updatePayment = (id: string, paymentData: Partial<Payment>) => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === id ? { ...payment, ...paymentData } : payment
      )
    );

    toast({
      title: "Pago actualizado",
      description: "Los datos del pago han sido actualizados"
    });
  };

  const addInvestor = (investorData: Omit<Investor, "id">) => {
    const validation = validateInvestorData(investorData);
    
    if (!validation.isValid) {
      toast({
        title: "Error al agregar inversor",
        description: validation.errors.join("\n"),
        variant: "destructive"
      });
      return false;
    }

    const newInvestor: Investor = {
      id: Date.now().toString(),
      ...investorData,
      vehicleCount: 0,
      status: "active",
    };
    
    setInvestors(prev => [...prev, newInvestor]);

    toast({
      title: "Inversor agregado",
      description: "El inversor ha sido registrado exitosamente"
    });

    return true;
  };

  const updateInvestor = (id: string, investorData: Partial<Investor>) => {
    setInvestors(prevInvestors =>
      prevInvestors.map(investor =>
        investor.id === id ? { ...investor, ...investorData } : investor
      )
    );

    // Si el inversor se inactiva, actualizar sus vehículos
    if (investorData.status === "inactive") {
      const investor = investors.find(i => i.id === id);
      if (investor) {
        setVehicles(prevVehicles =>
          prevVehicles.map(vehicle =>
            vehicle.investor === investor.name
              ? { ...vehicle, status: "inactive" }
              : vehicle
          )
        );
      }
    }

    toast({
      title: "Inversor actualizado",
      description: "Los datos del inversor han sido actualizados"
    });
  };

  const addDriver = (driverData: Omit<Driver, "id">) => {
    const validation = validateDriverData(driverData);
    
    if (!validation.isValid) {
      toast({
        title: "Error al agregar conductor",
        description: validation.errors.join("\n"),
        variant: "destructive"
      });
      return false;
    }

    const newDriver: Driver = {
      id: Date.now().toString(),
      ...driverData,
      status: "active",
    };
    
    setDrivers(prev => [...prev, newDriver]);

    toast({
      title: "Conductor agregado",
      description: "El conductor ha sido registrado exitosamente"
    });

    return true;
  };

  const updateDriver = (id: string, driverData: Partial<Driver>) => {
    setDrivers(prevDrivers =>
      prevDrivers.map(driver =>
        driver.id === id ? { ...driver, ...driverData } : driver
      )
    );

    // Si el conductor se inactiva, actualizar el vehículo asociado
    if (driverData.status === "inactive") {
      const driver = drivers.find(d => d.id === id);
      if (driver && driver.vehicleId) {
        setVehicles(prevVehicles =>
          prevVehicles.map(vehicle =>
            vehicle.id === driver.vehicleId
              ? { ...vehicle, driverId: undefined }
              : vehicle
          )
        );
      }
    }

    toast({
      title: "Conductor actualizado",
      description: "Los datos del conductor han sido actualizados"
    });
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
