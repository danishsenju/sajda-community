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
          full_name: string | null
          phone: string | null
          unit_blok: string | null
          role: 'jemaah' | 'ajk' | 'superadmin'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          unit_blok?: string | null
          role?: 'jemaah' | 'ajk' | 'superadmin'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          unit_blok?: string | null
          role?: 'jemaah' | 'ajk' | 'superadmin'
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      mosque_info: {
        Row: {
          id: number
          name: string
          address: string | null
          phone: string | null
          description: string | null
          gmaps_url: string | null
          has_wudhu: boolean
          has_womens_section: boolean
          has_parking: boolean
          has_accessibility: boolean
          parking_notes: string | null
          operating_notes: string | null
          jakim_zone: string
          updated_at: string
        }
        Insert: {
          id?: number
          name?: string
          address?: string | null
          phone?: string | null
          description?: string | null
          gmaps_url?: string | null
          has_wudhu?: boolean
          has_womens_section?: boolean
          has_parking?: boolean
          has_accessibility?: boolean
          parking_notes?: string | null
          operating_notes?: string | null
          jakim_zone?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          address?: string | null
          phone?: string | null
          description?: string | null
          gmaps_url?: string | null
          has_wudhu?: boolean
          has_womens_section?: boolean
          has_parking?: boolean
          has_accessibility?: boolean
          parking_notes?: string | null
          operating_notes?: string | null
          jakim_zone?: string
          updated_at?: string
        }
        Relationships: []
      }
      prayer_times: {
        Row: {
          id: string
          date: string
          fajr: string
          syuruk: string | null
          dhuhr: string
          asr: string
          maghrib: string
          isha: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          fajr: string
          syuruk?: string | null
          dhuhr: string
          asr: string
          maghrib: string
          isha: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          fajr?: string
          syuruk?: string | null
          dhuhr?: string
          asr?: string
          maghrib?: string
          isha?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          category: 'umum' | 'kecemasan' | 'ramadan' | 'kewangan'
          is_pinned: boolean
          expires_at: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: 'umum' | 'kecemasan' | 'ramadan' | 'kewangan'
          is_pinned?: boolean
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: 'umum' | 'kecemasan' | 'ramadan' | 'kewangan'
          is_pinned?: boolean
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      keperluan: {
        Row: {
          id: string
          title: string
          description: string
          category: 'bantuan_fizikal' | 'ilmu_tuisyen' | 'transport' | 'barangan' | 'lain'
          urgency: 'normal' | 'urgent'
          status: 'pending' | 'open' | 'in_progress' | 'resolved'
          posted_by: string | null
          approved_by: string | null
          approved_at: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: 'bantuan_fizikal' | 'ilmu_tuisyen' | 'transport' | 'barangan' | 'lain'
          urgency?: 'normal' | 'urgent'
          status?: 'pending' | 'open' | 'in_progress' | 'resolved'
          posted_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: 'bantuan_fizikal' | 'ilmu_tuisyen' | 'transport' | 'barangan' | 'lain'
          urgency?: 'normal' | 'urgent'
          status?: 'pending' | 'open' | 'in_progress' | 'resolved'
          posted_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      keperluan_helpers: {
        Row: {
          id: string
          keperluan_id: string
          helper_id: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          keperluan_id: string
          helper_id: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          keperluan_id?: string
          helper_id?: string
          message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          id: string
          title: string
          description: string | null
          category: 'solat' | 'kebajikan' | 'ramadan' | 'gotong_royong' | 'umum'
          program_date: string
          start_time: string
          end_time: string | null
          location: string | null
          needs_volunteers: boolean
          volunteer_slots: number
          is_published: boolean
          image_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: 'solat' | 'kebajikan' | 'ramadan' | 'gotong_royong' | 'umum'
          program_date: string
          start_time: string
          end_time?: string | null
          location?: string | null
          needs_volunteers?: boolean
          volunteer_slots?: number
          is_published?: boolean
          image_url?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: 'solat' | 'kebajikan' | 'ramadan' | 'gotong_royong' | 'umum'
          program_date?: string
          start_time?: string
          end_time?: string | null
          location?: string | null
          needs_volunteers?: boolean
          volunteer_slots?: number
          is_published?: boolean
          image_url?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      volunteer_signups: {
        Row: {
          id: string
          program_id: string
          user_id: string
          status: 'confirmed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          program_id: string
          user_id: string
          status?: 'confirmed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          user_id?: string
          status?: 'confirmed' | 'cancelled'
          created_at?: string
        }
        Relationships: []
      }
      kelas: {
        Row: {
          id: string
          title: string
          description: string | null
          ustaz_name: string | null
          category: 'quran' | 'fiqh' | 'akhlak' | 'bahasa_arab' | 'lain'
          schedule_day: string | null
          start_date: string | null
          end_date: string | null
          time_start: string | null
          time_end: string | null
          location: string | null
          capacity: number | null
          is_active: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          ustaz_name?: string | null
          category?: 'quran' | 'fiqh' | 'akhlak' | 'bahasa_arab' | 'lain'
          schedule_day?: string | null
          start_date?: string | null
          end_date?: string | null
          time_start?: string | null
          time_end?: string | null
          location?: string | null
          capacity?: number | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          ustaz_name?: string | null
          category?: 'quran' | 'fiqh' | 'akhlak' | 'bahasa_arab' | 'lain'
          schedule_day?: string | null
          start_date?: string | null
          end_date?: string | null
          time_start?: string | null
          time_end?: string | null
          location?: string | null
          capacity?: number | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      kelas_bookings: {
        Row: {
          id: string
          kelas_id: string
          user_id: string
          status: 'active' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          kelas_id: string
          user_id: string
          status?: 'active' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          kelas_id?: string
          user_id?: string
          status?: 'active' | 'cancelled'
          created_at?: string
        }
        Relationships: []
      }
      janaiz_notices: {
        Row: {
          id: string
          deceased_name: string
          age: number | null
          death_date: string
          jenazah_time: string | null
          jenazah_location: string | null
          burial_location_text: string | null
          burial_lat: number | null
          burial_lng: number | null
          notes: string | null
          posted_by: string | null
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deceased_name: string
          age?: number | null
          death_date: string
          jenazah_time?: string | null
          jenazah_location?: string | null
          burial_location_text?: string | null
          burial_lat?: number | null
          burial_lng?: number | null
          notes?: string | null
          posted_by?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deceased_name?: string
          age?: number | null
          death_date?: string
          jenazah_time?: string | null
          jenazah_location?: string | null
          burial_location_text?: string | null
          burial_lat?: number | null
          burial_lng?: number | null
          notes?: string | null
          posted_by?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      solat_counts: {
        Row: {
          pray_date: string
          prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
          count: number
        }
        Insert: {
          pray_date: string
          prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
          count?: number
        }
        Update: {
          pray_date?: string
          prayer?: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
          count?: number
        }
        Relationships: []
      }
      derma_accounts: {
        Row: {
          id: string
          bank: string
          account_name: string
          account_no: string
          color: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          bank: string
          account_name: string
          account_no: string
          color?: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          bank?: string
          account_name?: string
          account_no?: string
          color?: string
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      imams: {
        Row: {
          id: string
          name: string
          title: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          title?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          title?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      imam_schedule: {
        Row: {
          id: string
          date: string
          prayer: string
          imam_id: string
        }
        Insert: {
          id?: string
          date: string
          prayer: string
          imam_id: string
        }
        Update: {
          id?: string
          date?: string
          prayer?: string
          imam_id?: string
        }
        Relationships: []
      }
      lost_found: {
        Row: {
          id: string
          type: 'lost' | 'found'
          item_name: string
          description: string | null
          location: string | null
          contact: string | null
          is_resolved: boolean
          posted_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'lost' | 'found'
          item_name: string
          description?: string | null
          location?: string | null
          contact?: string | null
          is_resolved?: boolean
          posted_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'lost' | 'found'
          item_name?: string
          description?: string | null
          location?: string | null
          contact?: string | null
          is_resolved?: boolean
          posted_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_solat_count: {
        Args: { p_date: string; p_prayer: string }
        Returns: void
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

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type MosqueInfo = Database['public']['Tables']['mosque_info']['Row']
export type PrayerTime = Database['public']['Tables']['prayer_times']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type Keperluan = Database['public']['Tables']['keperluan']['Row']
export type KeperluanHelper = Database['public']['Tables']['keperluan_helpers']['Row']
export type Program = Database['public']['Tables']['programs']['Row']
export type VolunteerSignup = Database['public']['Tables']['volunteer_signups']['Row']
export type Kelas = Database['public']['Tables']['kelas']['Row']
export type KelasBooking = Database['public']['Tables']['kelas_bookings']['Row']
export type JanaizNotice = Database['public']['Tables']['janaiz_notices']['Row']
