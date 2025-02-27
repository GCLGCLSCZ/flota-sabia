
import { Vehicle, Investor, Driver } from "@/types";

export const validateVehicleData = (vehicle: Partial<Vehicle>) => {
  const errors: string[] = [];

  if (!vehicle.plate) errors.push("La placa del vehículo es requerida");
  if (!vehicle.brand) errors.push("La marca del vehículo es requerida");
  if (!vehicle.model) errors.push("El modelo del vehículo es requerido");
  if (!vehicle.investor) errors.push("Debe asignar un inversor al vehículo");
  if (!vehicle.dailyRate) errors.push("La tarifa diaria es requerida");

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateInvestorData = (investor: Partial<Investor>) => {
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

export const validateDriverData = (driver: Partial<Driver>) => {
  const errors: string[] = [];

  if (!driver.name) errors.push("El nombre del conductor es requerido");
  if (!driver.phone) errors.push("El teléfono del conductor es requerido");
  if (!driver.ci) errors.push("El número de CI es requerido");
  if (!driver.licenseNumber) errors.push("El número de licencia es requerido");
  if (!driver.licenseExpiry) errors.push("La fecha de vencimiento de la licencia es requerida");

  return {
    isValid: errors.length === 0,
    errors
  };
};
