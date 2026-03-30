-- Migration: Create all PostgreSQL enums for AviationIQ
-- Sprint 2 - Phase 1 Schema

CREATE TYPE user_role AS ENUM (
  'admin',
  'station_manager',
  'supervisor',
  'agent',
  'airline_client'
);

CREATE TYPE flight_status AS ENUM (
  'scheduled',
  'on_track',
  'at_risk',
  'delayed',
  'completed',
  'cancelled'
);

CREATE TYPE turnaround_event_type AS ENUM (
  'aircraft_arrival',
  'door_open',
  'deplaning_start',
  'deplaning_end',
  'cleaning_start',
  'cleaning_end',
  'catering_confirmed',
  'fueling_confirmed',
  'boarding_start',
  'boarding_end',
  'door_close',
  'pushback'
);

CREATE TYPE cleaning_level AS ENUM (
  'transit_clean',
  'full_clean',
  'deep_clean'
);

CREATE TYPE grooming_work_order_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE damage_report_status AS ENUM (
  'draft',
  'submitted',
  'supervisor_reviewed',
  'approved',
  'rejected'
);

CREATE TYPE damage_severity AS ENUM (
  'minor',
  'moderate',
  'major',
  'critical'
);

CREATE TYPE baggage_case_status AS ENUM (
  'reported',
  'located',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'closed'
);

CREATE TYPE baggage_issue_type AS ENUM (
  'lost',
  'damaged',
  'delayed',
  'misrouted'
);

CREATE TYPE notification_channel AS ENUM (
  'in_app',
  'email'
);

CREATE TYPE shift_type AS ENUM (
  'morning',
  'afternoon',
  'night'
);

CREATE TYPE agent_flight_role AS ENUM (
  'ramp_agent',
  'wing_walker',
  'marshaller',
  'cabin_cleaner',
  'customer_service_agent'
);
