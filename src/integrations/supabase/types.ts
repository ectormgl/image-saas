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
      credits: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_request_id: string
          image_url: string
          type: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_request_id: string
          image_url: string
          type: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_request_id?: string
          image_url?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_image_request_id_fkey"
            columns: ["image_request_id"]
            isOneToOne: false
            referencedRelation: "image_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      image_requests: {
        Row: {
          category: string | null
          created_at: string | null
          credit_used: boolean | null
          id: string
          image_input_url: string
          product_name: string
          slogan: string | null
          status: string
          user_id: string
          theme: string | null
          target_audience: string | null
          brand_colors: Json | null
          style_preferences: Json | null
          n8n_workflow_id: string | null
          n8n_execution_id: string | null
          processing_logs: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          credit_used?: boolean | null
          id?: string
          image_input_url: string
          product_name: string
          slogan?: string | null
          status?: string
          user_id: string
          theme?: string | null
          target_audience?: string | null
          brand_colors?: Json | null
          style_preferences?: Json | null
          n8n_workflow_id?: string | null
          n8n_execution_id?: string | null
          processing_logs?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          credit_used?: boolean | null
          id?: string
          image_input_url?: string
          product_name?: string
          slogan?: string | null
          status?: string
          user_id?: string
          theme?: string | null
          target_audience?: string | null
          brand_colors?: Json | null
          style_preferences?: Json | null
          n8n_workflow_id?: string | null
          n8n_execution_id?: string | null
          processing_logs?: Json | null
        }
        Relationships: []
      }
      n8n_configurations: {
        Row: {
          id: string
          user_id: string
          base_url: string
          api_key: string
          webhook_url: string | null
          workflow_id: string
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          base_url: string
          api_key: string
          webhook_url?: string | null
          workflow_id: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          base_url?: string
          api_key?: string
          webhook_url?: string | null
          workflow_id?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      processing_logs: {
        Row: {
          id: string
          image_request_id: string
          step_name: string
          status: string
          message: string | null
          data: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          image_request_id: string
          step_name: string
          status: string
          message?: string | null
          data?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          image_request_id?: string
          step_name?: string
          status?: string
          message?: string | null
          data?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_logs_image_request_id_fkey"
            columns: ["image_request_id"]
            isOneToOne: false
            referencedRelation: "image_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          id: string
          name: string
          category: string
          template: string
          variables: Json | null
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          template: string
          variables?: Json | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          template?: string
          variables?: Json | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          business_name: string | null
          default_slogan: string | null
          category: string | null
          brand_colors: Json | null
          logo_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          business_name?: string | null
          default_slogan?: string | null
          category?: string | null
          brand_colors?: Json | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          business_name?: string | null
          default_slogan?: string | null
          category?: string | null
          brand_colors?: Json | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
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
