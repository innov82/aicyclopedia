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
      industries: {
        Row: {
          category: string
          created_at: string
          hero_copy: string | null
          id: string
          name: string
          pain_points: Json | null
          published: boolean
          slug: string
          stats_blurb: string | null
        }
        Insert: {
          category: string
          created_at?: string
          hero_copy?: string | null
          id?: string
          name: string
          pain_points?: Json | null
          published?: boolean
          slug: string
          stats_blurb?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          hero_copy?: string | null
          id?: string
          name?: string
          pain_points?: Json | null
          published?: boolean
          slug?: string
          stats_blurb?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          industry_slug: string | null
          problem_text: string | null
          source_page: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          industry_slug?: string | null
          problem_text?: string | null
          source_page?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          industry_slug?: string | null
          problem_text?: string | null
          source_page?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          request_count?: number
          window_start: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      tool_rankings: {
        Row: {
          created_at: string
          fit_notes: string | null
          id: string
          industry_id: string | null
          rank: number
          tool_id: string
          use_case_id: string | null
          verdict: string | null
        }
        Insert: {
          created_at?: string
          fit_notes?: string | null
          id?: string
          industry_id?: string | null
          rank: number
          tool_id: string
          use_case_id?: string | null
          verdict?: string | null
        }
        Update: {
          created_at?: string
          fit_notes?: string | null
          id?: string
          industry_id?: string | null
          rank?: number
          tool_id?: string
          use_case_id?: string | null
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_rankings_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_rankings_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_rankings_use_case_id_fkey"
            columns: ["use_case_id"]
            isOneToOne: false
            referencedRelation: "use_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          affiliate_url: string | null
          cons: Json | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          integrations: Json | null
          logo_url: string | null
          name: string
          one_liner: string | null
          pricing_from: number | null
          pricing_model: string | null
          pros: Json | null
          published: boolean
          slug: string
          website_url: string | null
        }
        Insert: {
          affiliate_url?: string | null
          cons?: Json | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          integrations?: Json | null
          logo_url?: string | null
          name: string
          one_liner?: string | null
          pricing_from?: number | null
          pricing_model?: string | null
          pros?: Json | null
          published?: boolean
          slug: string
          website_url?: string | null
        }
        Update: {
          affiliate_url?: string | null
          cons?: Json | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          integrations?: Json | null
          logo_url?: string | null
          name?: string
          one_liner?: string | null
          pricing_from?: number | null
          pricing_model?: string | null
          pros?: Json | null
          published?: boolean
          slug?: string
          website_url?: string | null
        }
        Relationships: []
      }
      use_cases: {
        Row: {
          buyer_pain: string | null
          created_at: string
          id: string
          name: string
          published: boolean
          short_description: string | null
          slug: string
        }
        Insert: {
          buyer_pain?: string | null
          created_at?: string
          id?: string
          name: string
          published?: boolean
          short_description?: string | null
          slug: string
        }
        Update: {
          buyer_pain?: string | null
          created_at?: string
          id?: string
          name?: string
          published?: boolean
          short_description?: string | null
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_rate_limit: {
        Args: { _identifier: string; _window_start: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
