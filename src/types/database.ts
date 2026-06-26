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
      app_options: {
        Row: {
          active: boolean
          created_at: string
          kind: string
          label: string
          sort_order: number
          value: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          kind: string
          label?: string
          sort_order?: number
          value: string
        }
        Update: {
          active?: boolean
          created_at?: string
          kind?: string
          label?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
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
          watchers: string[]
          website: string
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
          watchers?: string[]
          website?: string
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
          watchers?: string[]
          website?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          region_id: string | null
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          region_id?: string | null
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          region_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "countries_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
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
          matched: boolean
          new_state: string | null
          payload: Json | null
          received_at: string
          target: string | null
          work_item_id: number
          work_item_type: string | null
        }
        Insert: {
          event_type?: string | null
          matched?: boolean
          new_state?: string | null
          payload?: Json | null
          received_at?: string
          target?: string | null
          work_item_id: number
          work_item_type?: string | null
        }
        Update: {
          event_type?: string | null
          matched?: boolean
          new_state?: string | null
          payload?: Json | null
          received_at?: string
          target?: string | null
          work_item_id?: number
          work_item_type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          brands: string[]
          countries: string[]
          created_at: string
          email: string
          full_name: string
          id: string
          is_global: boolean
          regions: string[]
          role: Database["public"]["Enums"]["app_role"]
          sbus: string[]
        }
        Insert: {
          brands?: string[]
          countries?: string[]
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_global?: boolean
          regions?: string[]
          role?: Database["public"]["Enums"]["app_role"]
          sbus?: string[]
        }
        Update: {
          brands?: string[]
          countries?: string[]
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_global?: boolean
          regions?: string[]
          role?: Database["public"]["Enums"]["app_role"]
          sbus?: string[]
        }
        Relationships: []
      }
      regions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
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
      auth_brands: { Args: never; Returns: string[] }
      auth_countries: { Args: never; Returns: string[] }
      auth_is_global: { Args: never; Returns: boolean }
      auth_regions: { Args: never; Returns: string[] }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      auth_sbus: { Args: never; Returns: string[] }
      auth_sees_all: { Args: never; Returns: boolean }
      auth_visible_countries: { Args: never; Returns: string[] }
      can_see_campaign: {
        Args: { c_country: string; c_sbu: string }
        Returns: boolean
      }
      region_member_countries: {
        Args: { region_names: string[] }
        Returns: string[]
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
        | "live"
        | "ended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["campaign_owner", "campaign_coordinator", "run_team", "admin"],
      campaign_status: [
        "draft",
        "in_progress",
        "ready",
        "briefed",
        "in_production",
        "live",
        "ended",
      ],
    },
  },
} as const

export type AppRole = Database["public"]["Enums"]["app_role"]
