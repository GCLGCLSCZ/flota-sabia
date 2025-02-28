
// Tipos de estado para vehículos
export type VehicleStatus = "active" | "maintenance" | "inactive";

// Tipos de pago
export type PaymentMethod = "cash" | "transfer";
export type PaymentStatus = "completed" | "pending" | "cancelled" | "analysing";

// Tipos de mantenimiento
export type MaintenanceType = "mechanical" | "body_paint";
export type MaintenanceStatus = "pending" | "completed" | "cancelled";

// Tipos de descuento
export type DiscountType = "insurance" | "repair" | "maintenance" | "other";
export type DiscountFrequency = "monthly" | "quarterly" | "biannual" | "annual";

// Tipos de cardex
export type CardexType = "oil_change" | "filter_change" | "spark_plugs" | "battery" | "other";

// Tipo para usuarios y permisos (necesarios para AuthContext)
export type UserRole = "admin" | "staff" | "viewer";
export interface UserPermissions {
  canEditVehicles: boolean;
  canEditPayments: boolean;
  canEditDrivers: boolean;
  canEditInvestors: boolean;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
}

// Tipo para pólizas de seguro
export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  company: string;
  contact: string;
  amount: number;
  startDate: string;
  endDate: string;
  isInvestorPaying: boolean;
  payments: InsurancePayment[];
}

export interface InsurancePayment {
  id: string;
  date: string;
  amount: number;
  description: string;
}

// Definición de vehículo
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  status: VehicleStatus;
  investor: string;
  dailyRate: number;
  driverName: string;
  driverPhone: string;
  driverId?: string;
  contractStartDate?: string;
  totalInstallments?: number;
  paidInstallments?: number;
  installmentAmount?: number;
  totalPaid?: number;
  nextMaintenance?: string;
  monthlyEarnings?: number;
  maintenanceHistory?: Maintenance[];
  cardex?: CardexItem[];
  discounts?: Discount[];
  daysNotWorked?: string[];
  insurancePolicies?: InsurancePolicy[];
}

// Definición de pago
export interface Payment {
  id: string;
  date: string;
  amount: number;
  concept: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  vehicleId: string;
  receiptNumber?: string;
  bankName?: string;
  transferNumber?: string;
}

// Definición de inversor
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
  firstName?: string;
  lastName?: string;
  vehicles?: Vehicle[]; // Agregar relación con vehículos
}

// Definición de chofer
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
  documentId?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  vehicleId?: string;
}

// Definición de configuración de sistema
export interface SystemSettings {
  id: string;
  gpsMonthlyFee: number;
  currency: string;
  dateFormat: string;
  timezone: string;
}

// Definición de mantenimiento
export interface Maintenance {
  id: string;
  vehicleId: string;
  date: string;
  description: string;
  cost: number;
  costMaterials: number;
  costLabor: number;
  salePrice: number;
  status: MaintenanceStatus;
  type?: MaintenanceType;
  proformaNumber?: string;
  isInsuranceCovered?: boolean;
}

// Definición de item de cardex
export interface CardexItem {
  id: string;
  type: CardexType;
  date: string;
  description: string;
  nextScheduledDate?: string;
  kilometersAtService?: number;
  nextServiceKilometers?: number;
  cost: number;
  complete: boolean;
  vehicleId: string; // Agregar para relación con vehículo
}

// Definición de descuento
export interface Discount {
  id: string;
  type: DiscountType;
  description: string;
  amount: number;
  date: string;
  applyToMonths: string[];
  recurring: boolean;
  frequency?: DiscountFrequency;
  vehicleId: string; // Agregar para relación con vehículo
}
