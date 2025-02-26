
export interface Maintenance {
  id: string;
  date: string;
  description: string;
  costMaterials: number;
  salePrice: number;
  status: "pending" | "in-progress" | "completed";
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  status: "active" | "maintenance" | "inactive";
  investor: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceHistory?: Maintenance[];
  daysNotWorked?: string[];
  dailyRate: number;
  monthlyEarnings?: number;
  driverName: string;
  driverPhone: string;
}

export interface Payment {
  id: string;
  vehicleId: string;
  amount: number;
  date: Date;
  concept: string;
  status: "pending" | "completed" | "cancelled";
  paymentMethod: "cash" | "transfer";
  receiptNumber: string;
  bankName?: string;
  transferNumber?: string;
}

export interface Investor {
  id: string;
  name: string;
  contact: string;
  documentId: string;
  bankAccount: string;
  vehicleCount: number;
  status: "active" | "inactive";
  lastPayment: string;
  vehicles?: Vehicle[];
  payments?: Payment[];
}
