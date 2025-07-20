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
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          setting_category: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_category: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_category?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_agents: {
        Row: {
          agent_email: string
          agent_name: string
          created_at: string
          id: string
          is_active: boolean
          is_online: boolean
          max_concurrent_chats: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_email: string
          agent_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_online?: boolean
          max_concurrent_chats?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_email?: string
          agent_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_online?: boolean
          max_concurrent_chats?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          agent_id: string | null
          assigned_to: string | null
          chat_ended_at: string | null
          chat_feedback: string | null
          chat_rating: number | null
          chat_started_at: string | null
          created_at: string
          customer_company: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          customer_social_media: string | null
          email_sent: boolean | null
          id: string
          last_message_content: string | null
          last_message_time: string | null
          platform: string
          status: string
          unread_count: number
          updated_at: string
          whatsapp_device_id: string | null
        }
        Insert: {
          agent_id?: string | null
          assigned_to?: string | null
          chat_ended_at?: string | null
          chat_feedback?: string | null
          chat_rating?: number | null
          chat_started_at?: string | null
          created_at?: string
          customer_company?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          customer_social_media?: string | null
          email_sent?: boolean | null
          id?: string
          last_message_content?: string | null
          last_message_time?: string | null
          platform: string
          status?: string
          unread_count?: number
          updated_at?: string
          whatsapp_device_id?: string | null
        }
        Update: {
          agent_id?: string | null
          assigned_to?: string | null
          chat_ended_at?: string | null
          chat_feedback?: string | null
          chat_rating?: number | null
          chat_started_at?: string | null
          created_at?: string
          customer_company?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          customer_social_media?: string | null
          email_sent?: boolean | null
          id?: string
          last_message_content?: string | null
          last_message_time?: string | null
          platform?: string
          status?: string
          unread_count?: number
          updated_at?: string
          whatsapp_device_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "chat_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_whatsapp_device_id_fkey"
            columns: ["whatsapp_device_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          conversation_id: string
          id: string
          media_url: string | null
          message_content: string
          message_time: string
          message_type: string | null
          platform_message_id: string | null
          sender_name: string | null
          sender_type: string
          whatsapp_message_id: string | null
        }
        Insert: {
          conversation_id: string
          id?: string
          media_url?: string | null
          message_content: string
          message_time?: string
          message_type?: string | null
          platform_message_id?: string | null
          sender_name?: string | null
          sender_type: string
          whatsapp_message_id?: string | null
        }
        Update: {
          conversation_id?: string
          id?: string
          media_url?: string | null
          message_content?: string
          message_time?: string
          message_type?: string | null
          platform_message_id?: string | null
          sender_name?: string | null
          sender_type?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_logos: {
        Row: {
          company_url: string | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          updated_at: string
        }
        Insert: {
          company_url?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          updated_at?: string
        }
        Update: {
          company_url?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_template: string
          created_at: string
          id: string
          is_active: boolean
          subject_template: string
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          body_template: string
          created_at?: string
          id?: string
          is_active?: boolean
          subject_template: string
          template_name: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          body_template?: string
          created_at?: string
          id?: string
          is_active?: boolean
          subject_template?: string
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          form_type: string
          id: string
          message: string
          name: string
          phone: string | null
          service: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          form_type: string
          id?: string
          message: string
          name: string
          phone?: string | null
          service?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          form_type?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          service?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invoice_id: string
          item_name: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id: string
          item_name: string
          quantity?: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string
          item_name?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_company: string | null
          client_email: string
          client_name: string
          created_at: string
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          lead_id: string | null
          notes: string | null
          quotation_id: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_percentage: number
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_company?: string | null
          client_email: string
          client_name: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          lead_id?: string | null
          notes?: string | null
          quotation_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_percentage?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_company?: string | null
          client_email?: string
          client_name?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          lead_id?: string | null
          notes?: string | null
          quotation_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_percentage?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "user_management"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          agent_type: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          item_name: string
          quantity: number
          quotation_id: string
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          item_name: string
          quantity?: number
          quotation_id: string
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          item_name?: string
          quantity?: number
          quotation_id?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_address: string | null
          client_company: string | null
          client_email: string
          client_name: string
          created_at: string
          id: string
          lead_id: string | null
          notes: string | null
          quotation_date: string
          quotation_number: string
          status: string
          subtotal: number
          tax_amount: number
          tax_percentage: number
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          client_address?: string | null
          client_company?: string | null
          client_email: string
          client_name: string
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          quotation_date?: string
          quotation_number: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_percentage?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          client_address?: string | null
          client_company?: string | null
          client_email?: string
          client_name?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          quotation_date?: string
          quotation_number?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_percentage?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "user_management"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          display_order: number | null
          estimated_duration: string | null
          id: string
          is_active: boolean | null
          price_currency: string | null
          price_starting_from: number | null
          service_category: string | null
          service_description: string | null
          service_features: Json | null
          service_image_url: string | null
          service_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          estimated_duration?: string | null
          id?: string
          is_active?: boolean | null
          price_currency?: string | null
          price_starting_from?: number | null
          service_category?: string | null
          service_description?: string | null
          service_features?: Json | null
          service_image_url?: string | null
          service_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          estimated_duration?: string | null
          id?: string
          is_active?: boolean | null
          price_currency?: string | null
          price_starting_from?: number | null
          service_category?: string | null
          service_description?: string | null
          service_features?: Json | null
          service_image_url?: string | null
          service_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          user_id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          user_id: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          user_id?: string
          value?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_company: string | null
          client_name: string
          client_photo_url: string | null
          client_position: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          rating: number
          testimonial_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_company?: string | null
          client_name: string
          client_photo_url?: string | null
          client_position?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number
          testimonial_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_company?: string | null
          client_name?: string
          client_photo_url?: string | null
          client_position?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number
          testimonial_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_management: {
        Row: {
          admin_user_id: string
          assigned_to: string | null
          client_company: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          client_position: string | null
          created_at: string
          estimated_value: number | null
          id: string
          last_contact_date: string | null
          lead_source: string | null
          lead_status: string | null
          next_follow_up: string | null
          notes: string | null
          tags: Json | null
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          assigned_to?: string | null
          client_company?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          client_position?: string | null
          created_at?: string
          estimated_value?: number | null
          id?: string
          last_contact_date?: string | null
          lead_source?: string | null
          lead_status?: string | null
          next_follow_up?: string | null
          notes?: string | null
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          assigned_to?: string | null
          client_company?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          client_position?: string | null
          created_at?: string
          estimated_value?: number | null
          id?: string
          last_contact_date?: string | null
          lead_source?: string | null
          lead_status?: string | null
          next_follow_up?: string | null
          notes?: string | null
          tags?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      website_content: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          metadata: Json | null
          section: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          section: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          section?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_configs: {
        Row: {
          access_token: string | null
          api_key: string | null
          app_id: string | null
          app_secret: string | null
          base_url: string | null
          business_account_id: string | null
          config_type: string
          created_at: string
          id: string
          is_active: boolean
          is_configured: boolean
          phone_number_id: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          api_key?: string | null
          app_id?: string | null
          app_secret?: string | null
          base_url?: string | null
          business_account_id?: string | null
          config_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_configured?: boolean
          phone_number_id?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          api_key?: string | null
          app_id?: string | null
          app_secret?: string | null
          base_url?: string | null
          business_account_id?: string | null
          config_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_configured?: boolean
          phone_number_id?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_devices: {
        Row: {
          connection_status: string
          created_at: string
          device_name: string
          id: string
          last_connected_at: string | null
          phone_number: string
          qr_code_data: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          connection_status?: string
          created_at?: string
          device_name: string
          id?: string
          last_connected_at?: string | null
          phone_number: string
          qr_code_data?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          connection_status?: string
          created_at?: string
          device_name?: string
          id?: string
          last_connected_at?: string | null
          phone_number?: string
          qr_code_data?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
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
