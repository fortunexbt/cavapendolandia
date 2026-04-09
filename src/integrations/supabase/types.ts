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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      initiatives: {
        Row: {
          created_at: string
          created_by: string | null
          details: string | null
          id: string
          is_active: boolean
          prompt: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          details?: string | null
          id?: string
          is_active?: boolean
          prompt: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          details?: string | null
          id?: string
          is_active?: boolean
          prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      meadow_elements: {
        Row: {
          canopy: number | null
          config_json: Json
          created_at: string
          created_by: string | null
          element_type: Database["public"]["Enums"]["meadow_element_type"]
          height: number
          id: string
          image_path: string | null
          is_hidden: boolean
          label: string | null
          position_x: number
          position_z: number
          rotation: number
          scale: number
          secondary_tone: string | null
          tone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          canopy?: number | null
          config_json?: Json
          created_at?: string
          created_by?: string | null
          element_type?: Database["public"]["Enums"]["meadow_element_type"]
          height?: number
          id?: string
          image_path?: string | null
          is_hidden?: boolean
          label?: string | null
          position_x?: number
          position_z?: number
          rotation?: number
          scale?: number
          secondary_tone?: string | null
          tone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          canopy?: number | null
          config_json?: Json
          created_at?: string
          created_by?: string | null
          element_type?: Database["public"]["Enums"]["meadow_element_type"]
          height?: number
          id?: string
          image_path?: string | null
          is_hidden?: boolean
          label?: string | null
          position_x?: number
          position_z?: number
          rotation?: number
          scale?: number
          secondary_tone?: string | null
          tone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      offerings: {
        Row: {
          approved_at: string | null
          author_name: string | null
          author_type: Database["public"]["Enums"]["author_type"]
          category: Database["public"]["Enums"]["offering_category"] | null
          consent_archive: boolean
          consent_reshare: boolean
          consent_rights: boolean
          created_at: string
          curatorial_note: string | null
          file_url: string | null
          hidden_at: string | null
          id: string
          link_url: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          note: string | null
          rejected_at: string | null
          status: Database["public"]["Enums"]["offering_status"]
          text_content: string | null
          title: string | null
        }
        Insert: {
          approved_at?: string | null
          author_name?: string | null
          author_type?: Database["public"]["Enums"]["author_type"]
          category?: Database["public"]["Enums"]["offering_category"] | null
          consent_archive?: boolean
          consent_reshare?: boolean
          consent_rights?: boolean
          created_at?: string
          curatorial_note?: string | null
          file_url?: string | null
          hidden_at?: string | null
          id?: string
          link_url?: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          note?: string | null
          rejected_at?: string | null
          status?: Database["public"]["Enums"]["offering_status"]
          text_content?: string | null
          title?: string | null
        }
        Update: {
          approved_at?: string | null
          author_name?: string | null
          author_type?: Database["public"]["Enums"]["author_type"]
          category?: Database["public"]["Enums"]["offering_category"] | null
          consent_archive?: boolean
          consent_reshare?: boolean
          consent_rights?: boolean
          created_at?: string
          curatorial_note?: string | null
          file_url?: string | null
          hidden_at?: string | null
          id?: string
          link_url?: string | null
          media_type?: Database["public"]["Enums"]["media_type"]
          note?: string | null
          rejected_at?: string | null
          status?: Database["public"]["Enums"]["offering_status"]
          text_content?: string | null
          title?: string | null
        }
        Relationships: []
      }
      page_content: {
        Row: {
          block_key: string
          body_text: string | null
          cta_href: string | null
          cta_label: string | null
          eyebrow: string | null
          id: string
          image_path: string | null
          is_enabled: boolean
          locale: string
          page_slug: string
          sort_order: number
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          block_key: string
          body_text?: string | null
          cta_href?: string | null
          cta_label?: string | null
          eyebrow?: string | null
          id?: string
          image_path?: string | null
          is_enabled?: boolean
          locale?: string
          page_slug: string
          sort_order?: number
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          block_key?: string
          body_text?: string | null
          cta_href?: string | null
          cta_label?: string | null
          eyebrow?: string | null
          id?: string
          image_path?: string | null
          is_enabled?: boolean
          locale?: string
          page_slug?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_messages: {
        Row: {
          category: Database["public"]["Enums"]["visitor_message_category"]
          created_at: string
          id: string
          is_read: boolean
          locale: string
          message: string
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["visitor_message_category"]
          created_at?: string
          id?: string
          is_read?: boolean
          locale?: string
          message: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["visitor_message_category"]
          created_at?: string
          id?: string
          is_read?: boolean
          locale?: string
          message?: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      author_type: "anonymous" | "name" | "instagram"
      meadow_element_type: "tree" | "monolith" | "lantern" | "billboard"
      media_type: "image" | "video" | "audio" | "text" | "pdf" | "link"
      offering_category: "grafica" | "musicale" | "letteraria"
      offering_status: "pending" | "approved" | "rejected" | "hidden"
      visitor_message_category: "domanda" | "richiesta" | "feedback"
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
      app_role: ["admin"],
      author_type: ["anonymous", "name", "instagram"],
      meadow_element_type: ["tree", "monolith", "lantern", "billboard"],
      media_type: ["image", "video", "audio", "text", "pdf", "link"],
      offering_category: ["grafica", "musicale", "letteraria"],
      offering_status: ["pending", "approved", "rejected", "hidden"],
      visitor_message_category: ["domanda", "richiesta", "feedback"],
    },
  },
} as const
