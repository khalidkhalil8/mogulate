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
      api_usage_logs: {
        Row: {
          api_type: string
          function_name: string
          id: string
          timestamp: string
          tokens_used: number
          user_id: string | null
        }
        Insert: {
          api_type: string
          function_name: string
          id?: string
          timestamp?: string
          tokens_used: number
          user_id?: string | null
        }
        Update: {
          api_type?: string
          function_name?: string
          id?: string
          timestamp?: string
          tokens_used?: number
          user_id?: string | null
        }
        Relationships: []
      }
      feature_waitlists: {
        Row: {
          email: string
          id: string
          joined_at: string
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          joined_at?: string
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          joined_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_waitlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_waitlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_entries: {
        Row: {
          created_at: string
          date: string
          feedback_source: string
          feedback_summary: string
          id: string
          project_id: string
          source_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          feedback_source: string
          feedback_summary: string
          id?: string
          project_id: string
          source_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          feedback_source?: string
          feedback_summary?: string
          id?: string
          project_id?: string
          source_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          stripe_customer_id: string | null
          subscription_started_at: string
          subscription_tier: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          stripe_customer_id?: string | null
          subscription_started_at?: string
          subscription_tier?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          stripe_customer_id?: string | null
          subscription_started_at?: string
          subscription_tier?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          competitors: Json | null
          created_at: string
          features: Json | null
          id: string
          idea: string | null
          market_gap_analysis: Json | null
          market_gaps: string | null
          title: string
          updated_at: string
          user_id: string
          validation_plan: string | null
        }
        Insert: {
          competitors?: Json | null
          created_at?: string
          features?: Json | null
          id?: string
          idea?: string | null
          market_gap_analysis?: Json | null
          market_gaps?: string | null
          title: string
          updated_at?: string
          user_id: string
          validation_plan?: string | null
        }
        Update: {
          competitors?: Json | null
          created_at?: string
          features?: Json | null
          id?: string
          idea?: string | null
          market_gap_analysis?: Json | null
          market_gaps?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          validation_plan?: string | null
        }
        Relationships: []
      }
      todo_items: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          project_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          project_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      api_usage_with_emails: {
        Row: {
          api_type: string | null
          email: string | null
          function_name: string | null
          id: string | null
          timestamp: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Relationships: []
      }
      feature_waitlists_with_emails: {
        Row: {
          email: string | null
          id: string | null
          joined_at: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          email?: string | null
          id?: string | null
          joined_at?: string | null
          user_id?: string | null
          user_type?: never
        }
        Update: {
          email?: string | null
          id?: string | null
          joined_at?: string | null
          user_id?: string | null
          user_type?: never
        }
        Relationships: [
          {
            foreignKeyName: "feature_waitlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_waitlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_complete: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          stripe_customer_id: string | null
          subscription_started_at: string | null
          subscription_tier: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          stripe_customer_id?: string | null
          subscription_started_at?: string | null
          subscription_tier?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          stripe_customer_id?: string | null
          subscription_started_at?: string | null
          subscription_tier?: string | null
        }
        Relationships: []
      }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
