
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  status: "active" | "maintenance" | "inactive";
  investor: string;
  dailyRate: number;
  driverName: string;
  driverPhone: string;
  driverId?: string;
  contractStartDate?: string;
  maintenanceHistory?: Maintenance[];
  daysNotWorked?: string[];
  totalInstallments?: number;
  paidInstallments?: number;
  installmentAmount?: number;
  totalPaid?: number;
  nextMaintenance?: string;
  monthlyEarnings?: number;
  cardex?: CardexItem[];
  discounts?: Discount[];
}

export interface Maintenance {
  id: string;
  date: string;
  description: string;
  cost: number;
  costMaterials: number;
  costLabor: number;
  salePrice: number;
  status: "pending" | "completed" | "cancelled";
  type?: "mechanical" | "body_paint";
  proformaNumber?: string;
  isInsuranceCovered?: boolean;
}

export interface CardexItem {
  id: string;
  type: "oil_change" | "filter_change" | "spark_plugs" | "battery" | "other";
  date: string;
  description: string;
  nextScheduledDate?: string;
  kilometersAtService?: number;
  nextServiceKilometers?: number;
  cost: number;
  complete: boolean;
}

export interface Discount {
  id: string;
  type: "insurance" | "repair" | "maintenance" | "other";
  description: string;
  amount: number;
  date: string;
  applyToMonths: string[]; // Lista de meses en formato 'YYYY-MM' a los que se aplica
  recurring: boolean;
  frequency?: "monthly" | "quarterly" | "biannual" | "annual";
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  concept: string;
  paymentMethod: "cash" | "transfer";
  status: "completed" | "pending" | "cancelled" | "analysing";
  vehicleId: string;
  receiptNumber?: string;
  bankName?: string;
  transferNumber?: string;
}

export interface Investor {
  id: string;
  name: string;
  contact: string;
  documentId: string;
  vehicleCount: number;
  status: "active" | "inactive";
  bankName?: string;
  bankAccount?: string;
  lastPayment: string;
  vehicles?: Vehicle[];
  firstName?: string;
  lastName?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  ci: string;
  email?: string;
  address?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  status?: "active" | "inactive";
  vehicles?: Vehicle[];
  documentId?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  vehicleId?: string;
}

export interface SystemSettings {
  id: string;
  gpsMonthlyFee: number;
  currency: string;
  dateFormat: string;
  timezone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions[];
}

export type UserRole = "admin" | "manager" | "user";

export type UserPermissions = 
  | "read:vehicles" 
  | "write:vehicles" 
  | "read:payments" 
  | "write:payments"
  | "read:investors"
  | "write:investors"
  | "read:drivers"
  | "write:drivers"
  | "read:settings"
  | "write:settings";
