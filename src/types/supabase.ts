
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string
          plate: string
          brand: string
          model: string
          year: string
          status: "active" | "maintenance" | "inactive"
          investor: string
          daily_rate: number
          driver_name: string
          driver_phone: string
          driver_id?: string
          contract_start_date?: string
          total_installments?: number
          paid_installments?: number
          installment_amount?: number
          total_paid?: number
          next_maintenance?: string
          monthly_earnings?: number
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          plate: string
          brand: string
          model: string
          year: string
          status: "active" | "maintenance" | "inactive"
          investor: string
          daily_rate: number
          driver_name: string
          driver_phone: string
          driver_id?: string
          contract_start_date?: string
          total_installments?: number
          paid_installments?: number
          installment_amount?: number
          total_paid?: number
          next_maintenance?: string
          monthly_earnings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plate?: string
          brand?: string
          model?: string
          year?: string
          status?: "active" | "maintenance" | "inactive"
          investor?: string
          daily_rate?: number
          driver_name?: string
          driver_phone?: string
          driver_id?: string
          contract_start_date?: string
          total_installments?: number
          paid_installments?: number
          installment_amount?: number
          total_paid?: number
          next_maintenance?: string
          monthly_earnings?: number
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          date: string
          amount: number
          concept: string
          payment_method: "cash" | "transfer"
          status: "completed" | "pending" | "cancelled" | "analysing"
          vehicle_id: string
          receipt_number?: string
          bank_name?: string
          transfer_number?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          date: string
          amount: number
          concept: string
          payment_method: "cash" | "transfer"
          status: "completed" | "pending" | "cancelled" | "analysing"
          vehicle_id: string
          receipt_number?: string
          bank_name?: string
          transfer_number?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          amount?: number
          concept?: string
          payment_method?: "cash" | "transfer"
          status?: "completed" | "pending" | "cancelled" | "analysing"
          vehicle_id?: string
          receipt_number?: string
          bank_name?: string
          transfer_number?: string
          updated_at?: string
        }
      }
      investors: {
        Row: {
          id: string
          name: string
          contact: string
          document_id: string
          vehicle_count: number
          status: "active" | "inactive"
          bank_name?: string
          bank_account?: string
          last_payment: string
          first_name?: string
          last_name?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          contact: string
          document_id: string
          vehicle_count: number
          status: "active" | "inactive"
          bank_name?: string
          bank_account?: string
          last_payment: string
          first_name?: string
          last_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string
          document_id?: string
          vehicle_count?: number
          status?: "active" | "inactive"
          bank_name?: string
          bank_account?: string
          last_payment?: string
          first_name?: string
          last_name?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          name: string
          phone: string
          ci: string
          email?: string
          address?: string
          license_number?: string
          license_expiry?: string
          status?: "active" | "inactive"
          document_id?: string
          emergency_contact?: string
          emergency_phone?: string
          vehicle_id?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          ci: string
          email?: string
          address?: string
          license_number?: string
          license_expiry?: string
          status?: "active" | "inactive"
          document_id?: string
          emergency_contact?: string
          emergency_phone?: string
          vehicle_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          ci?: string
          email?: string
          address?: string
          license_number?: string
          license_expiry?: string
          status?: "active" | "inactive"
          document_id?: string
          emergency_contact?: string
          emergency_phone?: string
          vehicle_id?: string
          updated_at?: string
        }
      }
      maintenance: {
        Row: {
          id: string
          vehicle_id: string
          date: string
          description: string
          cost: number
          cost_materials: number
          cost_labor: number
          sale_price: number
          status: "pending" | "completed" | "cancelled"
          type?: "mechanical" | "body_paint"
          proforma_number?: string
          is_insurance_covered?: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          date: string
          description: string
          cost: number
          cost_materials: number
          cost_labor: number
          sale_price: number
          status: "pending" | "completed" | "cancelled"
          type?: "mechanical" | "body_paint"
          proforma_number?: string
          is_insurance_covered?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          date?: string
          description?: string
          cost?: number
          cost_materials?: number
          cost_labor?: number
          sale_price?: number
          status?: "pending" | "completed" | "cancelled"
          type?: "mechanical" | "body_paint"
          proforma_number?: string
          is_insurance_covered?: boolean
          updated_at?: string
        }
      }
      cardex: {
        Row: {
          id: string
          vehicle_id: string
          type: "oil_change" | "filter_change" | "spark_plugs" | "battery" | "other"
          date: string
          description: string
          next_scheduled_date?: string
          kilometers_at_service?: number
          next_service_kilometers?: number
          cost: number
          complete: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          type: "oil_change" | "filter_change" | "spark_plugs" | "battery" | "other"
          date: string
          description: string
          next_scheduled_date?: string
          kilometers_at_service?: number
          next_service_kilometers?: number
          cost: number
          complete: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          type?: "oil_change" | "filter_change" | "spark_plugs" | "battery" | "other"
          date?: string
          description?: string
          next_scheduled_date?: string
          kilometers_at_service?: number
          next_service_kilometers?: number
          cost?: number
          complete?: boolean
          updated_at?: string
        }
      }
      discounts: {
        Row: {
          id: string
          vehicle_id: string
          type: "insurance" | "repair" | "maintenance" | "other"
          description: string
          amount: number
          date: string
          apply_to_months: string[]
          recurring: boolean
          frequency?: "monthly" | "quarterly" | "biannual" | "annual"
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          type: "insurance" | "repair" | "maintenance" | "other"
          description: string
          amount: number
          date: string
          apply_to_months: string[]
          recurring: boolean
          frequency?: "monthly" | "quarterly" | "biannual" | "annual"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          type?: "insurance" | "repair" | "maintenance" | "other"
          description?: string
          amount?: number
          date?: string
          apply_to_months?: string[]
          recurring?: boolean
          frequency?: "monthly" | "quarterly" | "biannual" | "annual"
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          gps_monthly_fee: number
          currency: string
          date_format: string
          timezone: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          gps_monthly_fee: number
          currency: string
          date_format: string
          timezone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gps_monthly_fee?: number
          currency?: string
          date_format?: string
          timezone?: string
          updated_at?: string
        }
      }
      days_not_worked: {
        Row: {
          id: string
          vehicle_id: string
          date: string
          reason?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          date: string
          reason?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          date?: string
          reason?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
