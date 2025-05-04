export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      travels: {
        Row: {
          travelid: number
          duration: number
          price: number
          date: string
          dates: string
          agencyid: number
          stationid: number
          vehicleid: number
          // rate field has been removed
        }
        Insert: {
          travelid: number // Changed from optional to required
          duration: number
          price: number
          date: string
          dates: string // This should be a valid date string
          agencyid: number
          stationid: number
          vehicleid: number
          // rate field has been removed
        }
        Update: {
          travelid?: number
          duration?: number
          price?: number
          date?: string
          dates?: string // This should be a valid date string
          agencyid?: number
          stationid?: number
          vehicleid?: number
          // rate field has been removed
        }
      }
      agencies: {
        Row: {
          agencyid: number
          name: string
          address: string
        }
        Insert: {
          agencyid?: number
          name: string
          address: string
        }
        Update: {
          agencyid?: number
          name?: string
          address?: string
        }
      }
      stations: {
        Row: {
          stationid: number
          name: string
          from: string
          to: string
          travelid?: number
        }
        Insert: {
          stationid?: number
          name: string
          from: string
          to: string
          travelid?: number
        }
        Update: {
          stationid?: number
          name?: string
          from?: string
          to?: string
          travelid?: number
        }
      }
      vehicles: {
        Row: {
          vehicleid: number
          name: string
          vehicletype: string
        }
        Insert: {
          vehicleid?: number
          name: string
          vehicletype: string
        }
        Update: {
          vehicleid?: number
          name?: string
          vehicletype?: string
        }
      }
      users: {
        Row: {
          userid: number
          username: string
          password: string
          email: string
          firstname: string
          lastname: string
          verified: boolean
          auth_id?: string // To link with Supabase Auth
        }
        Insert: {
          userid?: number
          username: string
          password: string
          email: string
          firstname: string
          lastname: string
          verified?: boolean
          auth_id?: string
        }
        Update: {
          userid?: number
          username?: string
          password?: string
          email?: string
          firstname?: string
          lastname?: string
          verified?: boolean
          auth_id?: string
        }
      }
      reports: {
        Row: {
          reportid: number
          name: string
          price: number
          address: string
        }
        Insert: {
          reportid?: number
          name: string
          price: number
          address: string
        }
        Update: {
          reportid?: number
          name?: string
          price?: number
          address?: string
        }
      }
      orders: {
        Row: {
          orderid: number
          totalprice: number
          status: string
          passengerid: number
          discountid: number
        }
        Insert: {
          orderid?: number
          totalprice: number
          status: string
          passengerid: number
          discountid?: number
        }
        Update: {
          orderid?: number
          totalprice?: number
          status?: string
          passengerid?: number
          discountid?: number
        }
      }
      passengers: {
        Row: {
          passengerid: number
          userid: number
          travelid: number
          passengers_no: number
          flightid?: number
          resortid?: number
          vehicleid?: number
        }
        Insert: {
          passengerid?: number
          userid: number
          travelid: number
          passengers_no: number
          flightid?: number
          resortid?: number
          vehicleid?: number
        }
        Update: {
          passengerid?: number
          userid?: number
          travelid?: number
          passengers_no?: number
          flightid?: number
          resortid?: number
          vehicleid?: number
        }
      }
      discounts: {
        Row: {
          discountid: number
          code: string
          discounttype: string
        }
        Insert: {
          discountid?: number
          code: string
          discounttype: string
        }
        Update: {
          discountid?: number
          code?: string
          discounttype?: string
        }
      }
      billings: {
        Row: {
          billingid: number
          amountpaid: number
          ispaid: boolean
          orderid: number
          userid: number
        }
        Insert: {
          billingid?: number
          amountpaid: number
          ispaid: boolean
          orderid: number
          userid: number
        }
        Update: {
          billingid?: number
          amountpaid?: number
          ispaid?: boolean
          orderid?: number
          userid?: number
        }
      }
      superadmins: {
        Row: {
          superadminid: number
          password: string
          userid: number
        }
        Insert: {
          superadminid?: number
          password: string
          userid: number
        }
        Update: {
          superadminid?: number
          password?: string
          userid?: number
        }
      }
      ops: {
        Row: {
          opid: number
          date: string
          code: string
          userid: number
        }
        Insert: {
          opid?: number
          date: string
          code: string
          userid: number
        }
        Update: {
          opid?: number
          date?: string
          code?: string
          userid?: number
        }
      }
      flights: {
        Row: {
          flightid: number
          name: string
          price: number
          from: string
          to: string
          date: string
          departure_time: string
          arrival_time: string
        }
        Insert: {
          flightid?: number
          name: string
          price: number
          from: string
          to: string
          date: string
          departure_time: string
          arrival_time: string
        }
        Update: {
          flightid?: number
          name?: string
          price?: number
          from?: string
          to?: string
          date?: string
          departure_time?: string
          arrival_time?: string
        }
      }
      resorts: {
        Row: {
          resortid: number
          name: string
          price: number
          address: string
        }
        Insert: {
          resortid?: number
          name: string
          price: number
          address: string
        }
        Update: {
          resortid?: number
          name?: string
          price?: number
          address?: string
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
  }
}
