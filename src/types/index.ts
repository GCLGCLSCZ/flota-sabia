export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  status:
    | "active"
    | "inactive"
    | "maintenance"
    | "available"
    | "rented"
    | "sold";
  investor: string;
  dailyRate: number;
  driverName?: string;
  driverPhone?: string;
  driverId?: string;
  contractStartDate?: string;
  totalInstallments?: number;
  paidInstallments?: number;
  installmentAmount?: number;
  totalPaid?: number;
  nextMaintenance?: string;
  monthlyEarnings?: number;
  maintenanceHistory?: Maintenance[];
  daysNotWorked?: string[];
  cardex?: CardexItem[];
  discounts?: Discount[];
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  concept: string;
  paymentMethod: "cash" | "transfer" | "check" | "other";
  status: "pending" | "completed" | "rejected";
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
  lastPayment?: string;
  firstName: string;
  lastName: string;
  vehicles?: Vehicle[];
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
  status: "active" | "inactive";
  documentId?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  vehicleId?: string;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  date: string;
  description: string;
  cost: number;
  costMaterials?: number;
  costLabor?: number;
  salePrice?: number;
  status: "pending" | "completed" | "rejected";
  type:
    | "preventive"
    | "corrective"
    | "predictive"
    | "periodic"
    | "emergency"
    | "other";
  proformaNumber?: string;
  isInsuranceCovered?: boolean;
}

export interface CardexItem {
  id: string;
  vehicleId: string;
  type:
    | "oil_change"
    | "tire_rotation"
    | "brake_service"
    | "spark_plug_replacement"
    | "air_filter_replacement"
    | "fuel_filter_replacement"
    | "transmission_service"
    | "coolant_flush"
    | "power_steering_flush"
    | "other";
  date: string;
  description?: string;
  nextScheduledDate?: string;
  kilometersAtService?: number;
  nextServiceKilometers?: number;
  cost?: number;
  complete: boolean;
}

export interface Discount {
  id: string;
  vehicleId: string;
  type: "percentage" | "fixed";
  description: string;
  amount: number;
  date: string;
  applyToMonths: number;
  recurring: boolean;
  frequency: "monthly" | "quarterly" | "yearly";
}

export interface Settlement {
  id: string;
  investorId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'pending' | 'completed';
  vehicleData?: Array<{
    vehicleId: string;
    workingDays: number;
    income: number;
    discounts: {
      maintenance: number;
      gps: number;
      total: number;
    };
    investorAmount: number;
    paid: number;
    balance: number;
  }>;
}

export interface SystemSettings {
  id: string;
  gpsMonthlyFee: number;
  currency: string;
  dateFormat: string;
  timezone: string;
  investorPercentage?: number; // Porcentaje que corresponde al inversionista (0.7 = 70%)
}
