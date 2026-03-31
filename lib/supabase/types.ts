export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      aircraft_types: {
        Row: {
          category: string | null
          code: string
          created_at: string
          deep_clean_duration_min: number | null
          default_turnaround_min: number | null
          full_clean_duration_min: number | null
          id: string
          manufacturer: string | null
          name: string
          organization_id: string
          transit_clean_duration_min: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          deep_clean_duration_min?: number | null
          default_turnaround_min?: number | null
          full_clean_duration_min?: number | null
          id?: string
          manufacturer?: string | null
          name: string
          organization_id: string
          transit_clean_duration_min?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          deep_clean_duration_min?: number | null
          default_turnaround_min?: number | null
          full_clean_duration_min?: number | null
          id?: string
          manufacturer?: string | null
          name?: string
          organization_id?: string
          transit_clean_duration_min?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      airline_clients: {
        Row: {
          code: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          safety_contact_email: string | null
          updated_at: string
        }
        Insert: {
          code: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          safety_contact_email?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          safety_contact_email?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "airline_clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_report_photos: {
        Row: {
          created_at: string
          damage_report_id: string
          file_name: string
          file_size: number | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          organization_id: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          damage_report_id: string
          file_name: string
          file_size?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          organization_id: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          damage_report_id?: string
          file_name?: string
          file_size?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          organization_id?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_report_photos_damage_report_id_fkey"
            columns: ["damage_report_id"]
            isOneToOne: false
            referencedRelation: "damage_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_report_photos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_report_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_reports: {
        Row: {
          aircraft_registration: string | null
          airline_notified_at: string | null
          created_at: string
          damage_location: string
          description: string
          flight_id: string | null
          id: string
          manager_approved_at: string | null
          manager_comments: string | null
          manager_id: string | null
          organization_id: string
          reported_by: string
          severity: Database["public"]["Enums"]["damage_severity"]
          station_id: string
          status: Database["public"]["Enums"]["damage_report_status"]
          supervisor_comments: string | null
          supervisor_id: string | null
          supervisor_reviewed_at: string | null
          updated_at: string
        }
        Insert: {
          aircraft_registration?: string | null
          airline_notified_at?: string | null
          created_at?: string
          damage_location: string
          description: string
          flight_id?: string | null
          id?: string
          manager_approved_at?: string | null
          manager_comments?: string | null
          manager_id?: string | null
          organization_id: string
          reported_by: string
          severity: Database["public"]["Enums"]["damage_severity"]
          station_id: string
          status?: Database["public"]["Enums"]["damage_report_status"]
          supervisor_comments?: string | null
          supervisor_id?: string | null
          supervisor_reviewed_at?: string | null
          updated_at?: string
        }
        Update: {
          aircraft_registration?: string | null
          airline_notified_at?: string | null
          created_at?: string
          damage_location?: string
          description?: string
          flight_id?: string | null
          id?: string
          manager_approved_at?: string | null
          manager_comments?: string | null
          manager_id?: string | null
          organization_id?: string
          reported_by?: string
          severity?: Database["public"]["Enums"]["damage_severity"]
          station_id?: string
          status?: Database["public"]["Enums"]["damage_report_status"]
          supervisor_comments?: string | null
          supervisor_id?: string | null
          supervisor_reviewed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_reports_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_reports_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_reports_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_reports_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          aircraft_registration: string | null
          aircraft_type_id: string | null
          airline_client_id: string
          created_at: string
          created_by: string | null
          destination: string | null
          flight_number: string
          gate: string | null
          id: string
          notes: string | null
          organization_id: string
          origin: string | null
          scheduled_arrival: string | null
          scheduled_departure: string | null
          station_id: string
          status: Database["public"]["Enums"]["flight_status"]
          updated_at: string
        }
        Insert: {
          actual_arrival?: string | null
          actual_departure?: string | null
          aircraft_registration?: string | null
          aircraft_type_id?: string | null
          airline_client_id: string
          created_at?: string
          created_by?: string | null
          destination?: string | null
          flight_number: string
          gate?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          origin?: string | null
          scheduled_arrival?: string | null
          scheduled_departure?: string | null
          station_id: string
          status?: Database["public"]["Enums"]["flight_status"]
          updated_at?: string
        }
        Update: {
          actual_arrival?: string | null
          actual_departure?: string | null
          aircraft_registration?: string | null
          aircraft_type_id?: string | null
          airline_client_id?: string
          created_at?: string
          created_by?: string | null
          destination?: string | null
          flight_number?: string
          gate?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          origin?: string | null
          scheduled_arrival?: string | null
          scheduled_departure?: string | null
          station_id?: string
          status?: Database["public"]["Enums"]["flight_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flights_aircraft_type_id_fkey"
            columns: ["aircraft_type_id"]
            isOneToOne: false
            referencedRelation: "aircraft_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flights_airline_client_id_fkey"
            columns: ["airline_client_id"]
            isOneToOne: false
            referencedRelation: "airline_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flights_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flights_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      grooming_assignments: {
        Row: {
          agent_id: string
          completion_time: string | null
          created_at: string
          duration_minutes: number | null
          entry_time: string | null
          id: string
          notes: string | null
          organization_id: string
          updated_at: string
          work_order_id: string
        }
        Insert: {
          agent_id: string
          completion_time?: string | null
          created_at?: string
          duration_minutes?: number | null
          entry_time?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          updated_at?: string
          work_order_id: string
        }
        Update: {
          agent_id?: string
          completion_time?: string | null
          created_at?: string
          duration_minutes?: number | null
          entry_time?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          updated_at?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grooming_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grooming_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grooming_assignments_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "grooming_work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      grooming_work_orders: {
        Row: {
          actual_duration_min: number | null
          aircraft_type_id: string | null
          cleaning_level: Database["public"]["Enums"]["cleaning_level"]
          completed_at: string | null
          created_at: string
          flight_id: string
          id: string
          notes: string | null
          organization_id: string
          required_agents: number
          standard_duration_min: number
          started_at: string | null
          status: Database["public"]["Enums"]["grooming_work_order_status"]
          supervisor_id: string | null
          updated_at: string
        }
        Insert: {
          actual_duration_min?: number | null
          aircraft_type_id?: string | null
          cleaning_level: Database["public"]["Enums"]["cleaning_level"]
          completed_at?: string | null
          created_at?: string
          flight_id: string
          id?: string
          notes?: string | null
          organization_id: string
          required_agents?: number
          standard_duration_min: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["grooming_work_order_status"]
          supervisor_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_duration_min?: number | null
          aircraft_type_id?: string | null
          cleaning_level?: Database["public"]["Enums"]["cleaning_level"]
          completed_at?: string | null
          created_at?: string
          flight_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          required_agents?: number
          standard_duration_min?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["grooming_work_order_status"]
          supervisor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grooming_work_orders_aircraft_type_id_fkey"
            columns: ["aircraft_type_id"]
            isOneToOne: false
            referencedRelation: "aircraft_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grooming_work_orders_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grooming_work_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grooming_work_orders_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          event_type: Database["public"]["Enums"]["turnaround_event_type"]
          id: string
          is_active: boolean
          organization_id: string
          recipient_role: Database["public"]["Enums"]["user_role"]
          station_id: string | null
          threshold_minutes: number | null
          updated_at: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          event_type: Database["public"]["Enums"]["turnaround_event_type"]
          id?: string
          is_active?: boolean
          organization_id: string
          recipient_role: Database["public"]["Enums"]["user_role"]
          station_id?: string | null
          threshold_minutes?: number | null
          updated_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          event_type?: Database["public"]["Enums"]["turnaround_event_type"]
          id?: string
          is_active?: boolean
          organization_id?: string
          recipient_role?: Database["public"]["Enums"]["user_role"]
          station_id?: string | null
          threshold_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_settings_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          organization_id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          station_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          organization_id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          station_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          station_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_compliance_records: {
        Row: {
          actual_duration_min: number | null
          calculated_at: string
          compliance_status: Database["public"]["Enums"]["sla_compliance_status"]
          created_at: string
          expected_duration_min: number
          flight_id: string
          id: string
          organization_id: string
          sla_configuration_id: string | null
          turnaround_event_id: string | null
          updated_at: string
        }
        Insert: {
          actual_duration_min?: number | null
          calculated_at?: string
          compliance_status: Database["public"]["Enums"]["sla_compliance_status"]
          created_at?: string
          expected_duration_min: number
          flight_id: string
          id?: string
          organization_id: string
          sla_configuration_id?: string | null
          turnaround_event_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_duration_min?: number | null
          calculated_at?: string
          compliance_status?: Database["public"]["Enums"]["sla_compliance_status"]
          created_at?: string
          expected_duration_min?: number
          flight_id?: string
          id?: string
          organization_id?: string
          sla_configuration_id?: string | null
          turnaround_event_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_compliance_records_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_compliance_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_compliance_records_sla_configuration_id_fkey"
            columns: ["sla_configuration_id"]
            isOneToOne: false
            referencedRelation: "sla_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_compliance_records_turnaround_event_id_fkey"
            columns: ["turnaround_event_id"]
            isOneToOne: false
            referencedRelation: "turnaround_events"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_configurations: {
        Row: {
          airline_client_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["turnaround_event_type"]
          id: string
          max_duration_minutes: number
          organization_id: string
          updated_at: string
        }
        Insert: {
          airline_client_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["turnaround_event_type"]
          id?: string
          max_duration_minutes: number
          organization_id: string
          updated_at?: string
        }
        Update: {
          airline_client_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["turnaround_event_type"]
          id?: string
          max_duration_minutes?: number
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_configurations_airline_client_id_fkey"
            columns: ["airline_client_id"]
            isOneToOne: false
            referencedRelation: "airline_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          airport_code: string
          airport_name: string
          city: string
          country: string
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          updated_at: string
        }
        Insert: {
          airport_code: string
          airport_name: string
          city: string
          country: string
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id: string
          updated_at?: string
        }
        Update: {
          airport_code?: string
          airport_name?: string
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      turnaround_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_message: string
          created_at: string
          event_type:
            | Database["public"]["Enums"]["turnaround_event_type"]
            | null
          flight_id: string
          id: string
          is_read: boolean
          organization_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message: string
          created_at?: string
          event_type?:
            | Database["public"]["Enums"]["turnaround_event_type"]
            | null
          flight_id: string
          id?: string
          is_read?: boolean
          organization_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message?: string
          created_at?: string
          event_type?:
            | Database["public"]["Enums"]["turnaround_event_type"]
            | null
          flight_id?: string
          id?: string
          is_read?: boolean
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turnaround_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnaround_alerts_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnaround_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      turnaround_events: {
        Row: {
          created_at: string
          event_sequence: number
          event_type: Database["public"]["Enums"]["turnaround_event_type"]
          flight_id: string
          id: string
          logged_at: string
          logged_by: string | null
          notes: string | null
          organization_id: string
          planned_time: string | null
        }
        Insert: {
          created_at?: string
          event_sequence: number
          event_type: Database["public"]["Enums"]["turnaround_event_type"]
          flight_id: string
          id?: string
          logged_at?: string
          logged_by?: string | null
          notes?: string | null
          organization_id: string
          planned_time?: string | null
        }
        Update: {
          created_at?: string
          event_sequence?: number
          event_type?: Database["public"]["Enums"]["turnaround_event_type"]
          flight_id?: string
          id?: string
          logged_at?: string
          logged_by?: string | null
          notes?: string | null
          organization_id?: string
          planned_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turnaround_events_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnaround_events_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnaround_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agent_flight_role:
        | "ramp_agent"
        | "wing_walker"
        | "marshaller"
        | "cabin_cleaner"
        | "customer_service_agent"
      baggage_case_status:
        | "reported"
        | "located"
        | "in_transit"
        | "out_for_delivery"
        | "delivered"
        | "closed"
      baggage_issue_type: "lost" | "damaged" | "delayed" | "misrouted"
      cleaning_level: "transit_clean" | "full_clean" | "deep_clean"
      damage_report_status:
        | "draft"
        | "submitted"
        | "supervisor_reviewed"
        | "approved"
        | "rejected"
      damage_severity: "minor" | "moderate" | "major" | "critical"
      flight_status:
        | "scheduled"
        | "on_track"
        | "at_risk"
        | "delayed"
        | "completed"
        | "cancelled"
      grooming_work_order_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
      notification_channel: "in_app" | "email"
      shift_type: "morning" | "afternoon" | "night"
      sla_compliance_status: "compliant" | "at_risk" | "breached" | "pending"
      turnaround_event_type:
        | "aircraft_arrival"
        | "door_open"
        | "deplaning_start"
        | "deplaning_end"
        | "cleaning_start"
        | "cleaning_end"
        | "catering_confirmed"
        | "fueling_confirmed"
        | "boarding_start"
        | "boarding_end"
        | "door_close"
        | "pushback"
      user_role:
        | "admin"
        | "station_manager"
        | "supervisor"
        | "agent"
        | "airline_client"
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

// Convenience type aliases used across the codebase
export type UserRole = Database["public"]["Enums"]["user_role"]
export type FlightStatus = Database["public"]["Enums"]["flight_status"]
export type TurnaroundEventType = Database["public"]["Enums"]["turnaround_event_type"]
export type CleaningLevel = Database["public"]["Enums"]["cleaning_level"]
export type GroomingWorkOrderStatus = Database["public"]["Enums"]["grooming_work_order_status"]
export type DamageReportStatus = Database["public"]["Enums"]["damage_report_status"]
export type DamageSeverity = Database["public"]["Enums"]["damage_severity"]
export type NotificationChannel = Database["public"]["Enums"]["notification_channel"]
export type SlaComplianceStatus = Database["public"]["Enums"]["sla_compliance_status"]

// Row type aliases
export type Organization = Database["public"]["Tables"]["organizations"]["Row"]
export type Station = Database["public"]["Tables"]["stations"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type AircraftType = Database["public"]["Tables"]["aircraft_types"]["Row"]
export type AirlineClient = Database["public"]["Tables"]["airline_clients"]["Row"]
export type SlaConfiguration = Database["public"]["Tables"]["sla_configurations"]["Row"]
export type Flight = Database["public"]["Tables"]["flights"]["Row"]
export type TurnaroundEvent = Database["public"]["Tables"]["turnaround_events"]["Row"]
export type TurnaroundAlert = Database["public"]["Tables"]["turnaround_alerts"]["Row"]
export type GroomingWorkOrder = Database["public"]["Tables"]["grooming_work_orders"]["Row"]
export type GroomingAssignment = Database["public"]["Tables"]["grooming_assignments"]["Row"]
export type DamageReport = Database["public"]["Tables"]["damage_reports"]["Row"]
export type DamageReportPhoto = Database["public"]["Tables"]["damage_report_photos"]["Row"]
export type NotificationSetting = Database["public"]["Tables"]["notification_settings"]["Row"]
export type SlaComplianceRecord = Database["public"]["Tables"]["sla_compliance_records"]["Row"]

export const Constants = {
  public: {
    Enums: {
      agent_flight_role: [
        "ramp_agent",
        "wing_walker",
        "marshaller",
        "cabin_cleaner",
        "customer_service_agent",
      ],
      baggage_case_status: [
        "reported",
        "located",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "closed",
      ],
      baggage_issue_type: ["lost", "damaged", "delayed", "misrouted"],
      cleaning_level: ["transit_clean", "full_clean", "deep_clean"],
      damage_report_status: [
        "draft",
        "submitted",
        "supervisor_reviewed",
        "approved",
        "rejected",
      ],
      damage_severity: ["minor", "moderate", "major", "critical"],
      flight_status: [
        "scheduled",
        "on_track",
        "at_risk",
        "delayed",
        "completed",
        "cancelled",
      ],
      grooming_work_order_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
      ],
      notification_channel: ["in_app", "email"],
      shift_type: ["morning", "afternoon", "night"],
      sla_compliance_status: ["compliant", "at_risk", "breached", "pending"],
      turnaround_event_type: [
        "aircraft_arrival",
        "door_open",
        "deplaning_start",
        "deplaning_end",
        "cleaning_start",
        "cleaning_end",
        "catering_confirmed",
        "fueling_confirmed",
        "boarding_start",
        "boarding_end",
        "door_close",
        "pushback",
      ],
      user_role: [
        "admin",
        "station_manager",
        "supervisor",
        "agent",
        "airline_client",
      ],
    },
  },
} as const
