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
      sales_records: {
        Row: {
          id: string
          order_id: string
          table_name: string
          staff: string
          payment_method: string
          date_time: string
          date_string: string
          type: string
          subtotal: number
          discount: number
          coupon_discount: number
          tax: number
          tax10: number
          tax8: number
          received_amount: number
          change: number
          payment_amount: number
          customer_count: number
          menu_items: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          table_name: string
          staff: string
          payment_method: string
          date_time: string
          date_string: string
          type: string
          subtotal: number
          discount: number
          coupon_discount: number
          tax: number
          tax10: number
          tax8: number
          received_amount: number
          change: number
          payment_amount: number
          customer_count: number
          menu_items: Json
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['sales_records']['Insert']>
      }
      sales_targets: {
        Row: {
          id: string
          type: 'daily' | 'weekly' | 'monthly'
          amount: number
          period: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'daily' | 'weekly' | 'monthly'
          amount: number
          period?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['sales_targets']['Insert']>
      }
    }
  }
}
