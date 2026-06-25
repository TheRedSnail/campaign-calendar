export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          assets: Json
          brand: string
          brief_id: string | null
          briefed_at: string | null
          briefed_date: string | null
          campaign_type: string
          channels: string[]
          coordinator: string | null
          cost_center: string
          country: string
          created_at: string
          created_by: string | null
          cta: string
          devops_id: number | null
          devops_state: string | null
          devops_url: string | null
          end_date: string | null
          go_live_date: string | null
          goal: string
          id: string
          language: string
          name: string
          notes: string
          owner: string
          owner_email: string
          priority: string
          progress: number
          recipients: Json
          regions: string[]
          sbu: string
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          synced_at: string | null
        }
        Insert: {
          assets?: Json
          brand?: string
          brief_id?: string | null
          briefed_at?: string | null
          briefed_date?: string | null
          campaign_type?: string
          channels?: string[]
          coordinator?: string | null
          cost_center?: string
          country?: string
          created_at?: string
          created_by?: string | null
          cta?: string
          devops_id?: number | null
          devops_state?: string | null
          devops_url?: string | null
          end_date?: string | null
          go_live_date?: string | null
          goal?: string
          id?: string
          language?: string
          name?: string
          notes?: string
          owner?: string
          owner_email?: string
          priority?: string
          progress?: number
          recipients?: Json
          regions?: string[]
          sbu?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          synced_at?: string | null
        }
        Update: {
          assets?: Json
          brand?: string
          brief_id?: string | null
          briefed_at?: string | null
          briefed_date?: string | null
          campaign_type?: string
          channels?: string[]
          coordinator?: string | null
          cost_center?: string
          country?: string
          created_at?: string
          created_by?: string | null
          cta?: string
          devops_id?: number | null
          devops_state?: string | null
          devops_url?: string | null
          end_date?: string | null
          go_live_date?: string | null
          goal?: string
          id?: string
          language?: string
          name?: string
          notes?: string
          owner?: string
          owner_email?: string
          priority?: string
          progress?: number
          recipients?: Json
          regions?: string[]
          sbu?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          synced_at?: string | null
        }
        Relationships: []
      }
      devops_tickets: {
        Row: {
          assignee: string
          campaign_id: string
          devops_id: number | null
          devops_state: string | null
          devops_url: string | null
          due_date: string
          id: string
          sla: string
          stage: string
          synced_at: string | null
          team: string
          title: string
        }
        Insert: {
          assignee?: string
          campaign_id: string
          devops_id?: number | null
          devops_state?: string | null
          devops_url?: string | null
          due_date?: string
          id: string
          sla?: string
          stage?: string
          synced_at?: string | null
          team: string
          title?: string
        }
        Update: {
          assignee?: string
          campaign_id?: string
          devops_id?: number | null
          devops_state?: string | null
          devops_url?: string | null
          due_date?: string
          id?: string
          sla?: string
          stage?: string
          synced_at?: string | null
          team?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "devops_tickets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      devops_webhook_events: {
        Row: {
          event_type: string | null
          id: string
          matched: boolean
          new_state: string | null
          payload: Json | null
          received_at: string
          target: string | null
          work_item_id: number | null
          work_item_type: string | null
        }
        Insert: {
          event_type?: string | null
          id?: string
          matched?: boolean
          new_state?: string | null
          payload?: Json | null
          received_at?: string
          target?: string | null
          work_item_id?: number | null
          work_item_type?: string | null
        }
        Update: {
          event_type?: string | null
          id?: string
          matched?: boolean
          new_state?: string | null
          payload?: Json | null
          received_at?: string
          target?: string | null
          work_item_id?: number | null
          work_item_type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          countries: string[]
          created_at: string
          email: string
          full_name: string
          id: string
          is_global: boolean
          role: Database["public"]["Enums"]["app_role"]
          sbus: string[]
        }
        Insert: {
          countries?: string[]
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_global?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          sbus?: string[]
        }
        Update: {
          countries?: string[]
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_global?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          sbus?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_brief: {
        Args: { p_campaign_id: string; p_tickets: Json }
        Returns: undefined
      }
      auth_countries: { Args: never; Returns: string[] }
      auth_is_global: { Args: never; Returns: boolean }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      auth_sbus: { Args: never; Returns: string[] }
      can_see_campaign: {
        Args: { c_country: string; c_sbu: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "campaign_owner" | "campaign_coordinator" | "run_team" | "admin"
      campaign_status:
        | "draft"
        | "in_progress"
        | "ready"
        | "briefed"
        | "in_production"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type AppRole = Database["public"]["Enums"]["app_role"]
