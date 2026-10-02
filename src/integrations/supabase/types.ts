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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      amenities: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          label: string
          property_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          label: string
          property_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          property_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_dates: {
        Row: {
          created_at: string
          end_date: string
          id: string
          property_id: string
          reason: string | null
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          property_id: string
          reason?: string | null
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          property_id?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          check_in: string
          check_out: string
          commission_amount: number
          commission_rate: number
          created_at: string
          currency: string
          guest_email: string | null
          guest_id: string | null
          guest_name: string
          guest_phone: string | null
          guests_count: number
          id: string
          internal_notes: string | null
          is_demo: boolean
          nightly_rate: number
          nights: number | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          property_id: string
          reference: string
          source: Database["public"]["Enums"]["booking_source"]
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          currency?: string
          guest_email?: string | null
          guest_id?: string | null
          guest_name: string
          guest_phone?: string | null
          guests_count?: number
          id?: string
          internal_notes?: string | null
          is_demo?: boolean
          nightly_rate?: number
          nights?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          property_id: string
          reference?: string
          source?: Database["public"]["Enums"]["booking_source"]
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          currency?: string
          guest_email?: string | null
          guest_id?: string | null
          guest_name?: string
          guest_phone?: string | null
          guests_count?: number
          id?: string
          internal_notes?: string | null
          is_demo?: boolean
          nightly_rate?: number
          nights?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          property_id?: string
          reference?: string
          source?: Database["public"]["Enums"]["booking_source"]
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          code: Database["public"]["Enums"]["booking_source"]
          created_at: string
          ical_export_url: string | null
          ical_import_url: string | null
          id: string
          last_synced_at: string | null
          name: string
          property_id: string
          status: Database["public"]["Enums"]["channel_status"]
          updated_at: string
        }
        Insert: {
          code: Database["public"]["Enums"]["booking_source"]
          created_at?: string
          ical_export_url?: string | null
          ical_import_url?: string | null
          id?: string
          last_synced_at?: string | null
          name: string
          property_id: string
          status?: Database["public"]["Enums"]["channel_status"]
          updated_at?: string
        }
        Update: {
          code?: Database["public"]["Enums"]["booking_source"]
          created_at?: string
          ical_export_url?: string | null
          ical_import_url?: string | null
          id?: string
          last_synced_at?: string | null
          name?: string
          property_id?: string
          status?: Database["public"]["Enums"]["channel_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          estimated_costs: number
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          expected_revenue: number
          guests_count: number
          id: string
          is_demo: boolean
          name: string
          notes: string | null
          property_id: string
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          vendors: string | null
        }
        Insert: {
          created_at?: string
          estimated_costs?: number
          event_date: string
          event_type?: Database["public"]["Enums"]["event_type"]
          expected_revenue?: number
          guests_count?: number
          id?: string
          is_demo?: boolean
          name: string
          notes?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          vendors?: string | null
        }
        Update: {
          created_at?: string
          estimated_costs?: number
          event_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          expected_revenue?: number
          guests_count?: number
          id?: string
          is_demo?: boolean
          name?: string
          notes?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          vendors?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean
          property_id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          property_id: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          property_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          alt_text: string | null
          caption: string | null
          category: string
          created_at: string
          id: string
          image_url: string
          is_published: boolean
          media_type: string
          property_id: string
          sort_order: number
          video_url: string | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url: string
          is_published?: boolean
          media_type?: string
          property_id: string
          sort_order?: number
          video_url?: string | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          is_published?: boolean
          media_type?: string
          property_id?: string
          sort_order?: number
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          country: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          property_id: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          property_id: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          assigned_to: string | null
          check_in: string | null
          check_out: string | null
          created_at: string
          email: string | null
          estimated_value: number | null
          guests_count: number | null
          id: string
          interest: string | null
          is_demo: boolean
          name: string
          notes: string | null
          phone: string | null
          property_id: string
          source: Database["public"]["Enums"]["booking_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          guests_count?: number | null
          id?: string
          interest?: string | null
          is_demo?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          property_id: string
          source?: Database["public"]["Enums"]["booking_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          guests_count?: number | null
          id?: string
          interest?: string | null
          is_demo?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          property_id?: string
          source?: Database["public"]["Enums"]["booking_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          property_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          property_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          assigned_to: string | null
          body: string
          booking_id: string | null
          channel: string
          created_at: string
          direction: string
          guest_name: string
          id: string
          inquiry_id: string | null
          property_id: string
          status: string
        }
        Insert: {
          assigned_to?: string | null
          body: string
          booking_id?: string | null
          channel?: string
          created_at?: string
          direction?: string
          guest_name: string
          id?: string
          inquiry_id?: string | null
          property_id: string
          status?: string
        }
        Update: {
          assigned_to?: string | null
          body?: string
          booking_id?: string | null
          channel?: string
          created_at?: string
          direction?: string
          guest_name?: string
          id?: string
          inquiry_id?: string | null
          property_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          method: string | null
          notes: string | null
          paid_at: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          end_date: string | null
          id: string
          is_active: boolean
          min_nights: number
          name: string
          nightly_rate: number
          priority: number
          property_id: string
          rule_type: Database["public"]["Enums"]["pricing_rule_type"]
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          min_nights?: number
          name: string
          nightly_rate: number
          priority?: number
          property_id: string
          rule_type: Database["public"]["Enums"]["pricing_rule_type"]
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          min_nights?: number
          name?: string
          nightly_rate?: number
          priority?: number
          property_id?: string
          rule_type?: Database["public"]["Enums"]["pricing_rule_type"]
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      properties: {
        Row: {
          bedrooms: number
          contact_email: string | null
          country: string | null
          created_at: string
          currency: string
          description: string | null
          google_maps_url: string | null
          hero_image_url: string | null
          id: string
          instagram_url: string | null
          is_published: boolean
          latitude: number | null
          location: string | null
          longitude: number | null
          max_guests: number
          name: string
          slug: string
          tagline: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          bedrooms?: number
          contact_email?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          google_maps_url?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_url?: string | null
          is_published?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_guests?: number
          name: string
          slug: string
          tagline?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          bedrooms?: number
          contact_email?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          google_maps_url?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_url?: string | null
          is_published?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_guests?: number
          name?: string
          slug?: string
          tagline?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      property_users: {
        Row: {
          created_at: string
          id: string
          property_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_users_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_overrides: {
        Row: {
          created_at: string
          date: string
          id: string
          nightly_rate: number
          note: string | null
          property_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          nightly_rate: number
          note?: string | null
          property_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          nightly_rate?: number
          note?: string | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_overrides_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_location: string | null
          author_name: string
          body: string
          created_at: string
          id: string
          is_demo: boolean
          is_published: boolean
          property_id: string
          rating: number
          sort_order: number
          stay_date: string | null
        }
        Insert: {
          author_location?: string | null
          author_name: string
          body: string
          created_at?: string
          id?: string
          is_demo?: boolean
          is_published?: boolean
          property_id: string
          rating?: number
          sort_order?: number
          stay_date?: string | null
        }
        Update: {
          author_location?: string | null
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          is_published?: boolean
          property_id?: string
          rating?: number
          sort_order?: number
          stay_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          bed_configuration: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          property_id: string
          sleeps: number
          sort_order: number
        }
        Insert: {
          bed_configuration?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          property_id: string
          sleeps?: number
          sort_order?: number
        }
        Update: {
          bed_configuration?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          property_id?: string
          sleeps?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          created_at: string
          id: string
          key: string
          property_id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          property_id: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          property_id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_content_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_see_financials: { Args: never; Returns: boolean }
      claim_first_owner: { Args: never; Returns: Json }
      convert_inquiry_to_booking: {
        Args: {
          _check_in: string
          _check_out: string
          _guests?: number
          _inquiry_id: string
          _notes?: string
          _status?: Database["public"]["Enums"]["booking_status"]
        }
        Returns: Json
      }
      create_booking_request: {
        Args: {
          _check_in: string
          _check_out: string
          _email: string
          _guests: number
          _name: string
          _phone: string
          _property_id: string
          _requests?: string
        }
        Returns: Json
      }
      create_inquiry: {
        Args: {
          _check_in?: string
          _check_out?: string
          _email: string
          _guests?: number
          _interest?: string
          _message?: string
          _name: string
          _phone: string
          _property_id: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_available: {
        Args: { _check_in: string; _check_out: string; _property_id: string }
        Returns: boolean
      }
      is_staff: { Args: never; Returns: boolean }
      nightly_rate_for: {
        Args: { _date: string; _property_id: string }
        Returns: number
      }
      platform_has_owner: { Args: never; Returns: boolean }
      quote_stay: {
        Args: {
          _check_in: string
          _check_out: string
          _guests?: number
          _property_id: string
        }
        Returns: Json
      }
      remove_user_role: { Args: { _user_id: string }; Returns: Json }
      set_user_role: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: Json
      }
    }
    Enums: {
      app_role: "owner" | "estatesrw_manager" | "operations_staff"
      booking_source:
        | "direct_website"
        | "whatsapp"
        | "instagram"
        | "airbnb"
        | "booking_com"
        | "expedia"
        | "other"
      booking_status:
        | "inquiry"
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
      channel_status: "connected" | "not_connected" | "pending"
      event_status: "planning" | "confirmed" | "completed" | "cancelled"
      event_type:
        | "bbq"
        | "brunch"
        | "private_party"
        | "birthday"
        | "corporate_retreat"
        | "celebration"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "negotiating"
        | "awaiting_payment"
        | "confirmed"
        | "lost"
        | "completed"
      payment_status: "pending" | "paid" | "partially_paid" | "refunded"
      pricing_rule_type:
        | "base"
        | "weekend"
        | "high_season"
        | "low_season"
        | "holiday"
        | "special_event"
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
    Enums: {
      app_role: ["owner", "estatesrw_manager", "operations_staff"],
      booking_source: [
        "direct_website",
        "whatsapp",
        "instagram",
        "airbnb",
        "booking_com",
        "expedia",
        "other",
      ],
      booking_status: [
        "inquiry",
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      channel_status: ["connected", "not_connected", "pending"],
      event_status: ["planning", "confirmed", "completed", "cancelled"],
      event_type: [
        "bbq",
        "brunch",
        "private_party",
        "birthday",
        "corporate_retreat",
        "celebration",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "negotiating",
        "awaiting_payment",
        "confirmed",
        "lost",
        "completed",
      ],
      payment_status: ["pending", "paid", "partially_paid", "refunded"],
      pricing_rule_type: [
        "base",
        "weekend",
        "high_season",
        "low_season",
        "holiday",
        "special_event",
      ],
    },
  },
} as const
