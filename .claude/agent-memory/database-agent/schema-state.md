---
name: Schema State
description: Current state of all tables, enums, and key relationships in the AviationIQ PostgreSQL schema
type: project
---

## Enums (migration 1)
- `user_role`: admin, station_manager, supervisor, agent, airline_client
- `flight_status`: scheduled, on_track, at_risk, delayed, completed, cancelled
- `turnaround_event_type`: aircraft_arrival, door_open, deplaning_start, deplaning_end, cleaning_start, cleaning_end, catering_confirmed, fueling_confirmed, boarding_start, boarding_end, door_close, pushback
- `cleaning_level`: transit_clean, full_clean, deep_clean
- `grooming_work_order_status`: pending, in_progress, completed, cancelled
- `damage_report_status`: draft, submitted, supervisor_reviewed, approved, rejected
- `damage_severity`: minor, moderate, major, critical
- `baggage_case_status`: reported, located, in_transit, out_for_delivery, delivered, closed
- `baggage_issue_type`: lost, damaged, delayed, misrouted
- `notification_channel`: in_app, email
- `shift_type`: morning, afternoon, night
- `agent_flight_role`: ramp_agent, wing_walker, marshaller, cabin_cleaner, customer_service_agent
- `sla_compliance_status` (Sprint 3, migration 9): compliant, at_risk, breached, pending

## Tables (in dependency order)

### Core (migration 3)
- `organizations`: id, name, logo_url — RLS uses `id` not `organization_id`
- `stations`: id, organization_id, airport_code, airport_name, city, country, is_active
- `profiles`: id (auth.users FK), organization_id, email, full_name, role, station_id, phone, avatar_url, is_active

### Aircraft & SLA (migration 4)
- `aircraft_types`: id, organization_id, code, name, manufacturer, category, transit/full/deep_clean_duration_min, default_turnaround_min
- `airline_clients`: id, organization_id, name, code (2-char), contact_name, contact_email, safety_contact_email, is_active
- `sla_configurations`: id, organization_id, airline_client_id, event_type (turnaround_event_type), max_duration_minutes — UNIQUE(org, airline_client, event_type)

### Turnaround (migration 5)
- `flights`: id, organization_id, station_id, airline_client_id, flight_number, aircraft_type_id, aircraft_registration, origin, destination, scheduled_arrival, scheduled_departure, actual_arrival, actual_departure, status, gate, notes, created_by
- `turnaround_events`: id, organization_id, flight_id, event_type, event_sequence, logged_at, logged_by, planned_time, notes — UNIQUE(flight_id, event_type)
- `turnaround_alerts`: id, organization_id, flight_id, event_type, alert_message, is_read, acknowledged_by, acknowledged_at

### Grooming (migration 6)
- `grooming_work_orders`: id, organization_id, flight_id, aircraft_type_id, cleaning_level, standard_duration_min, actual_duration_min, required_agents, status, supervisor_id, notes, started_at, completed_at
- `grooming_assignments`: id, organization_id, work_order_id, agent_id, entry_time, completion_time, duration_minutes, notes

### Damage (migration 7)
- `damage_reports`: id, organization_id, flight_id, aircraft_registration, station_id, damage_location, description, severity, status, reported_by, supervisor_id, supervisor_comments, supervisor_reviewed_at, manager_id, manager_comments, manager_approved_at, airline_notified_at
- `damage_report_photos`: id, organization_id, damage_report_id, storage_path, file_name, file_size, uploaded_by, gps_latitude, gps_longitude

### Notifications (migration 8)
- `notification_settings`: id, organization_id, event_type (turnaround_event_type), channel, recipient_role, station_id, threshold_minutes, is_active

### SLA Compliance (Sprint 3, migration 9)
- `sla_compliance_records`: id, organization_id, flight_id, turnaround_event_id, sla_configuration_id, expected_duration_min, actual_duration_min, compliance_status (sla_compliance_status), calculated_at — UNIQUE(flight_id, turnaround_event_id)

## RLS Policy Pattern
All tables use:
1. `tenant_isolation_select/insert/update/delete` — enforces `organization_id = (auth.jwt() ->> 'organization_id')::uuid`
2. Role-specific policies (admin_full_access, station_manager_crud, supervisor_*, agent_*, airline_client_*)
3. `organizations` uses `id` instead of `organization_id` for self-referential tenant check

## Key RLS Refinements (Sprint 3, migration 10)
- `airline_client` on flights/turnaround_events: scoped to `airline_client_id IN (SELECT id FROM airline_clients WHERE org AND is_active)`
- `supervisor` on damage_reports: DROP FOR ALL, replaced with SELECT + INSERT + UPDATE (status IN submitted/supervisor_reviewed only)
- `supervisor` on turnaround_events: DROP FOR ALL, replaced with SELECT + INSERT + UPDATE (no DELETE)
- `station_manager_final_approval` on damage_reports: explicit UPDATE policy for status IN (supervisor_reviewed, approved, rejected)
- `agent_read` added to notification_settings

## Auth Trigger (migration 11 — 20260330000003)
- `public.handle_new_user()` fires AFTER INSERT on `auth.users` (SECURITY DEFINER)
- Creates a `profiles` row using `raw_app_meta_data->>'organization_id'` and `raw_app_meta_data->>'user_role'`
- Falls back to the single org in the system when `organization_id` is absent and COUNT(organizations) = 1
- Skips profile creation (returns NEW) when org is ambiguous — admin assigns manually
- `ON CONFLICT (id) DO NOTHING` makes it idempotent
- Trigger name: `on_auth_user_created`

## Seed Files
- `seed.sql` — Sprint 2 base seed: org SkyBridge, stations b0000000/1/2/3, airline clients MJ/NS, 10 flights across 3 stations (dated 2026-03-29)
- `demo-seed.sql` — Demo seed: org AviationIQ Demo, stations with explicit UUIDs (YYZ/YUL/YOW), 3 airline clients (Porter PD, Air Canada Express QK, Jazz JZ), 5 aircraft types, 36 SLA configs, 10 YYZ flights for CURRENT_DATE, full turnaround events per status tier, 6 grooming work orders, 4 damage reports, 3 turnaround alerts. Admin user 55130461-ffef-4a68-9e71-10c86013c90c used as logged_by/reported_by.

## Edge Functions (Sprint 3)
- `calculate-sla`: POST {flight_id} → SLA compliance report per event. Uses caller JWT + RLS.
- `generate-report`: POST {organization_id, flight_id?, date_from?, date_to?} → structured JSON report
- `send-notification`: POST {event_type, organization_id, payload} → notification payload for Integration layer. Uses service role key.

**Why:** Sprint 3 deliverable — SLA calculation, reporting, and notification dispatch infrastructure.
**How to apply:** When adding new features that need SLA tracking, the calculate-sla function upserts into sla_compliance_records. generate-report reads from sla_compliance_records (not recalculating). send-notification returns a payload consumed by lib/email/ in the Integration layer.
