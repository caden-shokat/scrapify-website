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
      "Anstrex Data": {
        Row: {
          Brand: string | null
          Date: string | null
          Duration: number | null
          Gravity: number | null
          Headline: string
          Network: string | null
          Id: string
          "Image Url": string | null
          Strength: number | null
        }
        Insert: {
          Brand?: string | null
          Date?: string | null
          Duration?: number | null
          Gravity?: number | null
          Headline: string
          Network: string | null
          Id: string
          "Image Url"?: string | null
          Strength?: number | null
        }
        Update: {
          Brand?: string | null
          Date?: string | null
          Duration?: number | null
          Gravity?: number | null
          Headline?: string
          Network: string | null
          Id?: string
          "Image Url"?: string | null
          Strength?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          sourceTable: string
          sourceId: string
          favoritedAt: string
          aiHeadline: string
          headline: string
        }
        Insert: {
          id: string
          sourceTable?: string | null
          sourceId?: string | null
          favoritedAt?: string | null
          aiHeadline: string
          headline: string
        }
        Update: {
          id: string
          sourceTable?: string | null
          sourceId?: string | null
          favoritedAt?: string | null
          aiHeadline: string
          headline: string
        }
        Relationships: []
      }
      top_ai_headlines: {
        Row: {
          source_id?: string
          headline?: string
          week?: number
          year?: number
          frequency?: number
          ai_headline?: string | null
          id?: string | null
        }
        Update: {
          source_id?: string
          headline?: string
          week?: number
          year?: number
          frequency?: number
          ai_headline?: string | null
          id?: string | null
        }
        Insert: {
          source_id?: string
          headline?: string
          week?: number
          year?: number
          frequency?: number
          ai_headline?: string | null
          id?: string | null
        }
      }
      "Scrape Data": {
        Row: {
          "Ad Url": string | null
          Brand: string | null
          Date: string | null
          Headline: string | null
          Id: string
          "Image Url": string | null
          Platform: string | null
          Position: number | null
        }
        Insert: {
          "Ad Url"?: string | null
          Brand?: string | null
          Date?: string | null
          Headline?: string | null
          Id: string
          "Image Url"?: string | null
          Platform?: string | null
          Position?: number | null
        }
        Update: {
          "Ad Url"?: string | null
          Brand?: string | null
          Date?: string | null
          Headline?: string | null
          Id?: string
          "Image Url"?: string | null
          Platform?: string | null
          Position?: number | null
        }
        Relationships: []
      }
      selected_headlines: {
        Row: {
          brand: string | null
          frequency: number | null
          headline: string
          id: string
          image_url: string | null
          platform: string | null
          selected_at: string
          source_id: string | null
          source_table: string
        }
        Insert: {
          brand?: string | null
          frequency?: number | null
          headline: string
          id?: string
          image_url?: string | null
          platform?: string | null
          selected_at?: string
          source_id?: string | null
          source_table: string
        }
        Update: {
          brand?: string | null
          frequency?: number | null
          headline?: string
          id?: string
          image_url?: string | null
          platform?: string | null
          selected_at?: string
          source_id?: string | null
          source_table?: string
        }
        Relationships: []
      }
    }
    Views: {
      "High Potential CTR": {
        Row: {
          Brand: string | null
          Headline: string | null
          Platform: string | null
          Position: number | null
          Week: number | null
        }
        Relationships: []
      }
      "Top 20": {
        Row: {
          frequency: number | null
          Headline: string | null
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
