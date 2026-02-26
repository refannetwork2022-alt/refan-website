export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          opt_in: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          opt_in: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          opt_in?: boolean
          created_at?: string
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
      stories: {
        Row: { id: string; title: string; excerpt: string; content: string; image_url: string | null; category: string; date: string; created_at: string }
        Insert: { id?: string; title: string; excerpt?: string; content?: string; image_url?: string | null; category?: string; date?: string; created_at?: string }
        Update: { id?: string; title?: string; excerpt?: string; content?: string; image_url?: string | null; category?: string; date?: string; created_at?: string }
        Relationships: []
      }
      blog_posts: {
        Row: { id: string; title: string; excerpt: string; content: string; image_url: string | null; author: string; tags: string[]; date: string; created_at: string }
        Insert: { id?: string; title: string; excerpt?: string; content?: string; image_url?: string | null; author?: string; tags?: string[]; date?: string; created_at?: string }
        Update: { id?: string; title?: string; excerpt?: string; content?: string; image_url?: string | null; author?: string; tags?: string[]; date?: string; created_at?: string }
        Relationships: []
      }
      gallery_items: {
        Row: { id: string; title: string; url: string; type: string; date: string; created_at: string }
        Insert: { id?: string; title: string; url?: string; type?: string; date?: string; created_at?: string }
        Update: { id?: string; title?: string; url?: string; type?: string; date?: string; created_at?: string }
        Relationships: []
      }
      volunteer_submissions: {
        Row: { id: string; name: string; email: string; phone: string; type: string; message: string; country: string; date: string; created_at: string }
        Insert: { id?: string; name: string; email: string; phone?: string; type?: string; message?: string; country?: string; date?: string; created_at?: string }
        Update: { id?: string; name?: string; email?: string; phone?: string; type?: string; message?: string; country?: string; date?: string; created_at?: string }
        Relationships: []
      }
      donation_submissions: {
        Row: { id: string; name: string; email: string; amount: number; message: string; currency: string; date: string; created_at: string }
        Insert: { id?: string; name: string; email: string; amount: number; message?: string; currency?: string; date?: string; created_at?: string }
        Update: { id?: string; name?: string; email?: string; amount?: number; message?: string; currency?: string; date?: string; created_at?: string }
        Relationships: []
      }
      announcements: {
        Row: { id: string; title: string; content: string; image_url: string | null; donation_count: number; created_at: string }
        Insert: { id?: string; title: string; content?: string; image_url?: string | null; donation_count?: number; created_at?: string }
        Update: { id?: string; title?: string; content?: string; image_url?: string | null; donation_count?: number; created_at?: string }
        Relationships: []
      }
      contact_messages: {
        Row: { id: string; name: string; email: string; subject: string; message: string; created_at: string }
        Insert: { id?: string; name: string; email: string; subject?: string; message?: string; created_at?: string }
        Update: { id?: string; name?: string; email?: string; subject?: string; message?: string; created_at?: string }
        Relationships: []
      }
      members: {
        Row: { id: string; reg_number: string; surname: string; first_name: string; other_name: string; country_of_origin: string; country_of_residence: string; unhcr_id: string; phone: string; phone_code: string; gender: string; marital_status: string; date_of_birth: string; family_size: number; photo: string; document: string; payment_currency: string; payment_amount: number; registration_date: string; expiry_date: string; branch_name: string; username: string; created_at: string }
        Insert: { id?: string; reg_number: string; surname: string; first_name: string; other_name?: string; country_of_origin?: string; country_of_residence?: string; unhcr_id?: string; phone?: string; phone_code?: string; gender?: string; marital_status?: string; date_of_birth?: string; family_size?: number; photo?: string; document?: string; payment_currency?: string; payment_amount?: number; registration_date?: string; expiry_date?: string; branch_name?: string; username?: string; created_at?: string }
        Update: { id?: string; reg_number?: string; surname?: string; first_name?: string; other_name?: string; country_of_origin?: string; country_of_residence?: string; unhcr_id?: string; phone?: string; phone_code?: string; gender?: string; marital_status?: string; date_of_birth?: string; family_size?: number; photo?: string; document?: string; payment_currency?: string; payment_amount?: number; registration_date?: string; expiry_date?: string; branch_name?: string; username?: string; created_at?: string }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
