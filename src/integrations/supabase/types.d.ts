
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          avatar: string | null
          company: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role: string
          avatar?: string | null
          company?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          avatar?: string | null
          company?: string | null
          phone?: string | null
          created_at?: string
        }
      }
      ad_slots: {
        Row: {
          id: string
          title: string
          description: string
          channel_id: string
          channel_name: string
          start_time: string
          end_time: string
          duration_seconds: number
          price: number
          status: string
          estimated_viewers: number
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          channel_id: string
          channel_name: string
          start_time: string
          end_time: string
          duration_seconds: number
          price: number
          status: string
          estimated_viewers: number
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          channel_id?: string
          channel_name?: string
          start_time?: string
          end_time?: string
          duration_seconds?: number
          price?: number
          status?: string
          estimated_viewers?: number
          created_at?: string
          created_by?: string
        }
      }
      ads: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          file_url: string | null
          file_data: string | null
          thumbnail_url: string | null
          thumbnail_data: string | null
          advertiser_id: string
          advertiser_name: string
          created_at: string
          status: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: string
          file_url?: string | null
          file_data?: string | null
          thumbnail_url?: string | null
          thumbnail_data?: string | null
          advertiser_id: string
          advertiser_name: string
          created_at?: string
          status: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: string
          file_url?: string | null
          file_data?: string | null
          thumbnail_url?: string | null
          thumbnail_data?: string | null
          advertiser_id?: string
          advertiser_name?: string
          created_at?: string
          status?: string
        }
      }
      bookings: {
        Row: {
          id: string
          slot_id: string
          advertiser_id: string
          advertiser_name: string
          ad_id: string | null
          ad_title: string
          ad_description: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slot_id: string
          advertiser_id: string
          advertiser_name: string
          ad_id?: string | null
          ad_title: string
          ad_description: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slot_id?: string
          advertiser_id?: string
          advertiser_name?: string
          ad_id?: string | null
          ad_title?: string
          ad_description?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      channels: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          average_viewership: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          average_viewership: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          average_viewership?: number
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          created_at: string
          link_to: string | null
          target_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          created_at?: string
          link_to?: string | null
          target_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          created_at?: string
          link_to?: string | null
          target_id?: string | null
        }
      }
      performance_metrics: {
        Row: {
          id: string
          booking_id: string
          ad_id: string
          date: string
          views: number
          engagement_rate: number
          time_slot: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          ad_id: string
          date?: string
          views?: number
          engagement_rate?: number
          time_slot: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          ad_id?: string
          date?: string
          views?: number
          engagement_rate?: number
          time_slot?: string
          created_at?: string
        }
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
