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
      ad_slots: {
        Row: {
          channel_id: string
          channel_name: string
          created_at: string
          created_by: string
          description: string
          duration_seconds: number
          end_time: string
          estimated_viewers: number
          id: string
          price: number
          start_time: string
          status: string
          title: string
        }
        Insert: {
          channel_id: string
          channel_name: string
          created_at?: string
          created_by: string
          description: string
          duration_seconds: number
          end_time: string
          estimated_viewers: number
          id?: string
          price: number
          start_time: string
          status: string
          title: string
        }
        Update: {
          channel_id?: string
          channel_name?: string
          created_at?: string
          created_by?: string
          description?: string
          duration_seconds?: number
          end_time?: string
          estimated_viewers?: number
          id?: string
          price?: number
          start_time?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_slots_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          advertiser_id: string
          advertiser_name: string
          created_at: string
          description: string
          file_data: string | null
          file_url: string | null
          id: string
          status: string
          thumbnail_data: string | null
          thumbnail_url: string | null
          title: string
          type: string
        }
        Insert: {
          advertiser_id: string
          advertiser_name: string
          created_at?: string
          description: string
          file_data?: string | null
          file_url?: string | null
          id?: string
          status: string
          thumbnail_data?: string | null
          thumbnail_url?: string | null
          title: string
          type: string
        }
        Update: {
          advertiser_id?: string
          advertiser_name?: string
          created_at?: string
          description?: string
          file_data?: string | null
          file_url?: string | null
          id?: string
          status?: string
          thumbnail_data?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          ad_description: string
          ad_id: string | null
          ad_title: string
          advertiser_id: string
          advertiser_name: string
          created_at: string
          id: string
          slot_id: string
          status: string
          updated_at: string
        }
        Insert: {
          ad_description: string
          ad_id?: string | null
          ad_title: string
          advertiser_id: string
          advertiser_name: string
          created_at?: string
          id?: string
          slot_id: string
          status: string
          updated_at?: string
        }
        Update: {
          ad_description?: string
          ad_id?: string | null
          ad_title?: string
          advertiser_id?: string
          advertiser_name?: string
          created_at?: string
          id?: string
          slot_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "ad_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          average_viewership: number
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          average_viewership: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          average_viewership?: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link_to: string | null
          message: string
          read: boolean
          target_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_to?: string | null
          message: string
          read?: boolean
          target_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_to?: string | null
          message?: string
          read?: boolean
          target_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          ad_id: string
          booking_id: string
          created_at: string
          date: string
          engagement_rate: number
          id: string
          time_slot: string
          views: number
        }
        Insert: {
          ad_id: string
          booking_id: string
          created_at?: string
          date?: string
          engagement_rate?: number
          id?: string
          time_slot: string
          views?: number
        }
        Update: {
          ad_id?: string
          booking_id?: string
          created_at?: string
          date?: string
          engagement_rate?: number
          id?: string
          time_slot?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_metrics_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          avatar?: string | null
          company?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role: string
        }
        Update: {
          avatar?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
