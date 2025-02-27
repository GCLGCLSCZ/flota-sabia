
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
}

export interface Maintenance {
  id: string;
  date: string;
  description: string;
  cost: number;
  status: "pending" | "completed" | "cancelled";
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  concept: string;
  paymentMethod: "cash" | "transfer";
  status: "completed" | "pending" | "cancelled";
  vehicleId: string;
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
  ci: string;
  phone: string;
  email?: string;
  address?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  status?: "active" | "inactive";
  vehicles?: Vehicle[];
}

export interface SystemSettings {
  gpsMonthlyFee: number;
  currency: string;
  dateFormat: string;
  timezone: string;
}
