
import { Vehicle, Payment, Investor, Driver, SystemSettings, Maintenance, CardexItem, Discount } from "@/types";

// Transformaciones para Vehicle
export const vehicleToDb = (vehicle: Partial<Vehicle>) => ({
  id: vehicle.id,
  plate: vehicle.plate,
  brand: vehicle.brand,
  model: vehicle.model,
  year: vehicle.year,
  status: vehicle.status,
  investor: vehicle.investor,
  daily_rate: vehicle.dailyRate,
  driver_name: vehicle.driverName,
  driver_phone: vehicle.driverPhone,
  driver_id: vehicle.driverId,
  contract_start_date: vehicle.contractStartDate,
  total_installments: vehicle.totalInstallments,
  paid_installments: vehicle.paidInstallments,
  installment_amount: vehicle.installmentAmount,
  total_paid: vehicle.totalPaid,
  next_maintenance: vehicle.nextMaintenance,
  monthly_earnings: vehicle.monthlyEarnings,
  // No transformamos días no trabajados, mantenimientos, cardex o descuentos directamente
  // ya que están en tablas relacionadas
});

export const vehicleFromDb = (dbVehicle: any): Partial<Vehicle> => ({
  id: dbVehicle.id,
  plate: dbVehicle.plate,
  brand: dbVehicle.brand,
  model: dbVehicle.model,
  year: dbVehicle.year,
  status: dbVehicle.status,
  investor: dbVehicle.investor,
  dailyRate: dbVehicle.daily_rate,
  driverName: dbVehicle.driver_name,
  driverPhone: dbVehicle.driver_phone,
  driverId: dbVehicle.driver_id,
  contractStartDate: dbVehicle.contract_start_date,
  totalInstallments: dbVehicle.total_installments,
  paidInstallments: dbVehicle.paid_installments,
  installmentAmount: dbVehicle.installment_amount,
  totalPaid: dbVehicle.total_paid,
  nextMaintenance: dbVehicle.next_maintenance,
  monthlyEarnings: dbVehicle.monthly_earnings,
  // maintenanceHistory, daysNotWorked, cardex y discounts se cargarán por separado
});

// Transformaciones para Payment
export const paymentToDb = (payment: Partial<Payment>) => ({
  id: payment.id,
  date: payment.date,
  amount: payment.amount,
  concept: payment.concept,
  payment_method: payment.paymentMethod,
  status: payment.status,
  vehicle_id: payment.vehicleId,
  receipt_number: payment.receiptNumber,
  bank_name: payment.bankName,
  transfer_number: payment.transferNumber,
});

export const paymentFromDb = (dbPayment: any): Partial<Payment> => ({
  id: dbPayment.id,
  date: dbPayment.date,
  amount: dbPayment.amount,
  concept: dbPayment.concept,
  paymentMethod: dbPayment.payment_method,
  status: dbPayment.status,
  vehicleId: dbPayment.vehicle_id,
  receiptNumber: dbPayment.receipt_number,
  bankName: dbPayment.bank_name,
  transferNumber: dbPayment.transfer_number,
});

// Transformaciones para Investor
export const investorToDb = (investor: Partial<Investor>) => ({
  id: investor.id,
  name: investor.name,
  contact: investor.contact,
  document_id: investor.documentId,
  vehicle_count: investor.vehicleCount,
  status: investor.status,
  bank_name: investor.bankName,
  bank_account: investor.bankAccount,
  last_payment: investor.lastPayment,
  first_name: investor.firstName,
  last_name: investor.lastName,
});

export const investorFromDb = (dbInvestor: any): Partial<Investor> => ({
  id: dbInvestor.id,
  name: dbInvestor.name,
  contact: dbInvestor.contact,
  documentId: dbInvestor.document_id,
  vehicleCount: dbInvestor.vehicle_count,
  status: dbInvestor.status,
  bankName: dbInvestor.bank_name,
  bankAccount: dbInvestor.bank_account,
  lastPayment: dbInvestor.last_payment,
  firstName: dbInvestor.first_name,
  lastName: dbInvestor.last_name,
});

// Transformaciones para Driver
export const driverToDb = (driver: Partial<Driver>) => ({
  id: driver.id,
  name: driver.name,
  phone: driver.phone,
  ci: driver.ci,
  email: driver.email,
  address: driver.address,
  license_number: driver.licenseNumber,
  license_expiry: driver.licenseExpiry,
  status: driver.status,
  document_id: driver.documentId,
  emergency_contact: driver.emergencyContact,
  emergency_phone: driver.emergencyPhone,
  vehicle_id: driver.vehicleId,
});

export const driverFromDb = (dbDriver: any): Partial<Driver> => ({
  id: dbDriver.id,
  name: dbDriver.name,
  phone: dbDriver.phone,
  ci: dbDriver.ci,
  email: dbDriver.email,
  address: dbDriver.address,
  licenseNumber: dbDriver.license_number,
  licenseExpiry: dbDriver.license_expiry,
  status: dbDriver.status,
  documentId: dbDriver.document_id,
  emergencyContact: dbDriver.emergency_contact,
  emergencyPhone: dbDriver.emergency_phone,
  vehicleId: dbDriver.vehicle_id,
});

// Transformaciones para Maintenance
export const maintenanceToDb = (maintenance: Partial<Maintenance>) => ({
  id: maintenance.id,
  vehicle_id: maintenance.vehicleId,
  date: maintenance.date,
  description: maintenance.description,
  cost: maintenance.cost,
  cost_materials: maintenance.costMaterials,
  cost_labor: maintenance.costLabor,
  sale_price: maintenance.salePrice,
  status: maintenance.status,
  type: maintenance.type,
  proforma_number: maintenance.proformaNumber,
  is_insurance_covered: maintenance.isInsuranceCovered,
});

export const maintenanceFromDb = (dbMaintenance: any): Partial<Maintenance> => ({
  id: dbMaintenance.id,
  vehicleId: dbMaintenance.vehicle_id,
  date: dbMaintenance.date,
  description: dbMaintenance.description,
  cost: dbMaintenance.cost,
  costMaterials: dbMaintenance.cost_materials,
  costLabor: dbMaintenance.cost_labor,
  salePrice: dbMaintenance.sale_price,
  status: dbMaintenance.status,
  type: dbMaintenance.type,
  proformaNumber: dbMaintenance.proforma_number,
  isInsuranceCovered: dbMaintenance.is_insurance_covered,
});

// Transformaciones para CardexItem
export const cardexToDb = (cardex: Partial<CardexItem>) => ({
  id: cardex.id,
  vehicle_id: cardex.vehicleId,
  type: cardex.type,
  date: cardex.date,
  description: cardex.description,
  next_scheduled_date: cardex.nextScheduledDate,
  kilometers_at_service: cardex.kilometersAtService,
  next_service_kilometers: cardex.nextServiceKilometers,
  cost: cardex.cost,
  complete: cardex.complete,
});

export const cardexFromDb = (dbCardex: any): Partial<CardexItem> => ({
  id: dbCardex.id,
  vehicleId: dbCardex.vehicle_id,
  type: dbCardex.type,
  date: dbCardex.date,
  description: dbCardex.description,
  nextScheduledDate: dbCardex.next_scheduled_date,
  kilometersAtService: dbCardex.kilometers_at_service,
  nextServiceKilometers: dbCardex.next_service_kilometers,
  cost: dbCardex.cost,
  complete: dbCardex.complete,
});

// Transformaciones para Discount
export const discountToDb = (discount: Partial<Discount>) => ({
  id: discount.id,
  vehicle_id: discount.vehicleId,
  type: discount.type,
  description: discount.description,
  amount: discount.amount,
  date: discount.date,
  apply_to_months: discount.applyToMonths,
  recurring: discount.recurring,
  frequency: discount.frequency,
});

export const discountFromDb = (dbDiscount: any): Partial<Discount> => ({
  id: dbDiscount.id,
  vehicleId: dbDiscount.vehicle_id,
  type: dbDiscount.type,
  description: dbDiscount.description,
  amount: dbDiscount.amount,
  date: dbDiscount.date,
  applyToMonths: dbDiscount.apply_to_months,
  recurring: dbDiscount.recurring,
  frequency: dbDiscount.frequency,
});

// Transformaciones para SystemSettings
export const settingsToDb = (settings: Partial<SystemSettings>) => ({
  id: settings.id,
  gps_monthly_fee: settings.gpsMonthlyFee,
  currency: settings.currency,
  date_format: settings.dateFormat,
  timezone: settings.timezone,
});

export const settingsFromDb = (dbSettings: any): Partial<SystemSettings> => ({
  id: dbSettings.id,
  gpsMonthlyFee: dbSettings.gps_monthly_fee,
  currency: dbSettings.currency,
  dateFormat: dbSettings.date_format,
  timezone: dbSettings.timezone,
});
