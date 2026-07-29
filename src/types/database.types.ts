export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          details: string | null
          id: string
          timestamp: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          details?: string | null
          id: string
          timestamp?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          details?: string | null
          id?: string
          timestamp?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      campaign_users: {
        Row: {
          address: string | null
          coordinator_name: string | null
          created_at: string | null
          deputado_estadual: string | null
          documents: Json | null
          electoral_zone: string
          full_name: string
          id: string
          pix_key: string | null
          role: string
          social_media: string | null
          status: string | null
          updated_at: string | null
          whatsapp: string
        }
        Insert: {
          address?: string | null
          coordinator_name?: string | null
          created_at?: string | null
          deputado_estadual?: string | null
          documents?: Json | null
          electoral_zone: string
          full_name: string
          id: string
          pix_key?: string | null
          role: string
          social_media?: string | null
          status?: string | null
          updated_at?: string | null
          whatsapp: string
        }
        Update: {
          address?: string | null
          coordinator_name?: string | null
          created_at?: string | null
          deputado_estadual?: string | null
          documents?: Json | null
          electoral_zone?: string
          full_name?: string
          id?: string
          pix_key?: string | null
          role?: string
          social_media?: string | null
          status?: string | null
          updated_at?: string | null
          whatsapp?: string
        }
        Relationships: []
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
