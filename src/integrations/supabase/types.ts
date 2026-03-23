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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      club_events: {
        Row: {
          amount: number
          banner_image_url: string | null
          club_id: string
          created_at: string
          description: string | null
          end_datetime: string
          event_mode: string
          event_name: string
          event_type: string
          id: string
          instagram_link: string | null
          keywords: string | null
          manual_registrations: number
          pricing_type: string
          short_name: string | null
          start_datetime: string
          status: string
          total_fund: number
          updated_at: string
          venue: string | null
          venue_details: string | null
          website_url: string | null
        }
        Insert: {
          amount?: number
          banner_image_url?: string | null
          club_id: string
          created_at?: string
          description?: string | null
          end_datetime: string
          event_mode?: string
          event_name: string
          event_type?: string
          id?: string
          instagram_link?: string | null
          keywords?: string | null
          manual_registrations?: number
          pricing_type?: string
          short_name?: string | null
          start_datetime: string
          status?: string
          total_fund?: number
          updated_at?: string
          venue?: string | null
          venue_details?: string | null
          website_url?: string | null
        }
        Update: {
          amount?: number
          banner_image_url?: string | null
          club_id?: string
          created_at?: string
          description?: string | null
          end_datetime?: string
          event_mode?: string
          event_name?: string
          event_type?: string
          id?: string
          instagram_link?: string | null
          keywords?: string | null
          manual_registrations?: number
          pricing_type?: string
          short_name?: string | null
          start_datetime?: string
          status?: string
          total_fund?: number
          updated_at?: string
          venue?: string | null
          venue_details?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_registrations: {
        Row: {
          department: string | null
          event_id: string
          id: string
          registration_date: string
          roll_no: string | null
          student_email: string | null
          student_name: string
          team_name: string | null
          user_id: string | null
          year: string | null
        }
        Insert: {
          department?: string | null
          event_id: string
          id?: string
          registration_date?: string
          roll_no?: string | null
          student_email?: string | null
          student_name: string
          team_name?: string | null
          user_id?: string | null
          year?: string | null
        }
        Update: {
          department?: string | null
          event_id?: string
          id?: string
          registration_date?: string
          roll_no?: string | null
          student_email?: string | null
          student_name?: string
          team_name?: string | null
          user_id?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "club_events"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          club_name: string
          created_at: string
          email: string
          id: string
          instagram_url: string | null
        }
        Insert: {
          club_name: string
          created_at?: string
          email: string
          id?: string
          instagram_url?: string | null
        }
        Update: {
          club_name?: string
          created_at?: string
          email?: string
          id?: string
          instagram_url?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          amount_paid: number
          created_at: string
          department: string
          event_id: string
          id: string
          roll_no: string
          student_name: string
          team_name: string | null
          user_id: string
          year: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          department: string
          event_id: string
          id?: string
          roll_no: string
          student_name: string
          team_name?: string | null
          user_id: string
          year: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          department?: string
          event_id?: string
          id?: string
          roll_no?: string
          student_name?: string
          team_name?: string | null
          user_id?: string
          year?: string
        }
        Relationships: []
      }
      faculty_profiles: {
        Row: {
          avatar_url: string | null
          contact: string
          created_at: string
          department: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          contact?: string
          created_at?: string
          department?: string
          email?: string
          id: string
          name?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          contact?: string
          created_at?: string
          department?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      faculty_programs: {
        Row: {
          banner_image_url: string | null
          created_at: string
          description: string | null
          end_datetime: string
          id: string
          mode: string
          program_type: string
          short_description: string | null
          start_datetime: string
          status: string
          title: string
          venue: string | null
        }
        Insert: {
          banner_image_url?: string | null
          created_at?: string
          description?: string | null
          end_datetime: string
          id?: string
          mode?: string
          program_type?: string
          short_description?: string | null
          start_datetime: string
          status?: string
          title: string
          venue?: string | null
        }
        Update: {
          banner_image_url?: string | null
          created_at?: string
          description?: string | null
          end_datetime?: string
          id?: string
          mode?: string
          program_type?: string
          short_description?: string | null
          start_datetime?: string
          status?: string
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      faculty_registrations: {
        Row: {
          contact: string
          department: string
          email: string
          faculty_id: string
          faculty_name: string
          id: string
          organization_role: string | null
          program_id: string
          registered_at: string
        }
        Insert: {
          contact?: string
          department?: string
          email?: string
          faculty_id: string
          faculty_name: string
          id?: string
          organization_role?: string | null
          program_id: string
          registered_at?: string
        }
        Update: {
          contact?: string
          department?: string
          email?: string
          faculty_id?: string
          faculty_name?: string
          id?: string
          organization_role?: string | null
          program_id?: string
          registered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_registrations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "faculty_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          contact: string
          created_at: string
          department: string
          id: string
          name: string
          personal_email: string
          updated_at: string
          year: string
        }
        Insert: {
          avatar_url?: string | null
          contact?: string
          created_at?: string
          department?: string
          id: string
          name?: string
          personal_email?: string
          updated_at?: string
          year?: string
        }
        Update: {
          avatar_url?: string | null
          contact?: string
          created_at?: string
          department?: string
          id?: string
          name?: string
          personal_email?: string
          updated_at?: string
          year?: string
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
    Enums: {},
  },
} as const
