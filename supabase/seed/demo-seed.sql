-- =============================================================================
-- AviationIQ Demo Seed Data
-- Organization: AviationIQ Demo (a0000000-0000-0000-0000-000000000001)
-- Stations:
--   YYZ = 615caa01-563a-41e8-b9dd-cefddb6e2e2a
--   YUL = b19f95da-c572-4b1d-bbf8-874528d08e51
--   YOW = 7269881a-2939-4c41-bf2b-89934e3b4da9
-- Admin user: 55130461-ffef-4a68-9e71-10c86013c90c
--
-- All inserts use ON CONFLICT DO NOTHING for idempotency.
-- Bypasses RLS — run via service role or with session_replication_role = replica.
-- =============================================================================

SET session_replication_role = 'replica';

-- =============================================================================
-- Organization (upsert name to AviationIQ Demo if running fresh)
-- =============================================================================
INSERT INTO organizations (id, name, logo_url)
VALUES ('a0000000-0000-0000-0000-000000000001', 'AviationIQ Demo', NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Stations
-- =============================================================================
INSERT INTO stations (id, organization_id, airport_code, airport_name, city, country)
VALUES
  ('615caa01-563a-41e8-b9dd-cefddb6e2e2a', 'a0000000-0000-0000-0000-000000000001',
   'YYZ', 'Toronto Pearson International Airport', 'Toronto', 'Canada'),
  ('b19f95da-c572-4b1d-bbf8-874528d08e51', 'a0000000-0000-0000-0000-000000000001',
   'YUL', 'Montréal-Trudeau International Airport', 'Montréal', 'Canada'),
  ('7269881a-2939-4c41-bf2b-89934e3b4da9', 'a0000000-0000-0000-0000-000000000001',
   'YOW', 'Ottawa Macdonald-Cartier International Airport', 'Ottawa', 'Canada')
ON CONFLICT (organization_id, airport_code) DO NOTHING;

-- =============================================================================
-- Airline Clients
-- =============================================================================
INSERT INTO airline_clients (id, organization_id, name, code, contact_name, contact_email, safety_contact_email)
VALUES
  ('ac100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Porter Airlines', 'PD', 'Marcus Delgado', 'm.delgado@flyporter.com', 'safety@flyporter.com'),
  ('ac100000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Air Canada Express', 'QK', 'Linda Tran', 'l.tran@aircanada.com', 'safety.express@aircanada.com'),
  ('ac100000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Jazz Aviation', 'JZ', 'Robert Osei', 'r.osei@jazzaviation.com', 'safety@jazzaviation.com')
ON CONFLICT (organization_id, code) DO NOTHING;

-- =============================================================================
-- Aircraft Types
-- =============================================================================
INSERT INTO aircraft_types (id, organization_id, code, name, manufacturer, category,
  transit_clean_duration_min, full_clean_duration_min, deep_clean_duration_min, default_turnaround_min)
VALUES
  ('at100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'DH8D', 'DHC-8-400', 'Bombardier', 'turboprop', 15, 35, 90, 45),
  ('at100000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'CRJ9', 'CRJ-900', 'Bombardier', 'regional_jet', 12, 30, 80, 40),
  ('at100000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'E175', 'E175', 'Embraer', 'regional_jet', 12, 28, 75, 38),
  ('at100000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'ATR7', 'ATR-72', 'ATR', 'turboprop', 10, 25, 70, 35),
  ('at100000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'CRJ2', 'CRJ-200', 'Bombardier', 'regional_jet', 10, 22, 65, 30)
ON CONFLICT (organization_id, code) DO NOTHING;

-- =============================================================================
-- SLA Configurations (12 event types × 3 airline clients = 36 rows)
-- =============================================================================

-- Porter Airlines (PD)
INSERT INTO sla_configurations (organization_id, airline_client_id, event_type, max_duration_minutes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'aircraft_arrival',   5),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'door_open',          3),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'deplaning_start',    2),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'deplaning_end',      8),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'cleaning_start',     3),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'cleaning_end',      20),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'catering_confirmed', 15),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'fueling_confirmed',  15),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'boarding_start',      5),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'boarding_end',       12),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'door_close',          3),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000001', 'pushback',            5)
ON CONFLICT (organization_id, airline_client_id, event_type) DO NOTHING;

-- Air Canada Express (QK)
INSERT INTO sla_configurations (organization_id, airline_client_id, event_type, max_duration_minutes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'aircraft_arrival',   5),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'door_open',          3),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'deplaning_start',    2),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'deplaning_end',      8),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'cleaning_start',     3),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'cleaning_end',      20),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'catering_confirmed', 15),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'fueling_confirmed',  15),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'boarding_start',      5),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'boarding_end',       12),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'door_close',          3),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000002', 'pushback',            5)
ON CONFLICT (organization_id, airline_client_id, event_type) DO NOTHING;

-- Jazz Aviation (JZ)
INSERT INTO sla_configurations (organization_id, airline_client_id, event_type, max_duration_minutes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'aircraft_arrival',   5),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'door_open',          3),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'deplaning_start',    2),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'deplaning_end',      8),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'cleaning_start',     3),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'cleaning_end',      20),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'catering_confirmed', 15),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'fueling_confirmed',  15),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'boarding_start',      5),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'boarding_end',       12),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'door_close',          3),
  ('a0000000-0000-0000-0000-000000000001', 'ac100000-0000-0000-0000-000000000003', 'pushback',            5)
ON CONFLICT (organization_id, airline_client_id, event_type) DO NOTHING;

-- =============================================================================
-- Flights (10 at YYZ for today)
-- Flight IDs: fl10xxxx
-- Schedule spread: 06:00 – 22:00 local (UTC-4 = EDT)
--
-- Status mix:
--   completed  : PD123, QK456, JZ789
--   on_track   : PD201, QK502
--   at_risk    : JZ310, QK618
--   scheduled  : PD405, JZ901
--   delayed    : PD777
-- =============================================================================
INSERT INTO flights (
  id, organization_id, station_id, airline_client_id,
  flight_number, aircraft_type_id, aircraft_registration,
  origin, destination,
  scheduled_arrival, scheduled_departure,
  actual_arrival, actual_departure,
  status, gate
)
VALUES

-- ── COMPLETED ────────────────────────────────────────────────────────────────

-- PD123  Porter  DHC-8-400  YOW→YYZ  06:30 arr / 08:00 dep  completed
('fl100000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'ac100000-0000-0000-0000-000000000001',
 'PD123', 'at100000-0000-0000-0000-000000000001', 'C-FPDA',
 'YOW', 'YYZ',
 CURRENT_DATE + INTERVAL '6 hours 30 minutes',
 CURRENT_DATE + INTERVAL '8 hours',
 CURRENT_DATE + INTERVAL '6 hours 27 minutes',
 CURRENT_DATE + INTERVAL '7 hours 58 minutes',
 'completed', 'B14'),

-- QK456  Air Canada Express  CRJ-900  YUL→YYZ  09:00 arr / 10:30 dep  completed
('fl100000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'ac100000-0000-0000-0000-000000000002',
 'QK456', 'at100000-0000-0000-0000-000000000002', 'C-FQKB',
 'YUL', 'YYZ',
 CURRENT_DATE + INTERVAL '9 hours',
 CURRENT_DATE + INTERVAL '10 hours 30 minutes',
 CURRENT_DATE + INTERVAL '8 hours 58 minutes',
 CURRENT_DATE + INTERVAL '10 hours 28 minutes',
 'completed', 'C22'),

-- JZ789  Jazz  E175  YOW→YYZ  11:15 arr / 12:45 dep  completed
('fl100000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'ac100000-0000-0000-0000-000000000003',
 'JZ789', 'at100000-0000-0000-0000-000000000003', 'C-FJZC',
 'YOW', 'YYZ',
 CURRENT_DATE + INTERVAL '11 hours 15 minutes',
 CURRENT_DATE + INTERVAL '12 hours 45 minutes',
 CURRENT_DATE + INTERVAL '11 hours 12 minutes',
 CURRENT_DATE + INTERVAL '12 hours 43 minutes',
 'completed', 'B18'),

-- ── ON TRACK ─────────────────────────────────────────────────────────────────

-- PD201  Porter  ATR-72  YUL→YYZ  14:00 arr / 15:30 dep  on_track
('fl100000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'ac100000-0000-0000-0000-000000000001',
 'PD201', 'at100000-0000-0000-0000-000000000004', 'C-FPDD',
 'YUL', 'YYZ',
 CURRENT_DATE + INTERVAL '14 hours',
 CURRENT_DATE + INTERVAL '15 hours 30 minutes',
 CURRENT_DATE + INTERVAL '13 hours 58 minutes',
 NULL,
 'on_track', 'A7'),

-- QK502  Air Canada Express  CRJ-200  YOW→YYZ  15:45 arr / 17:10 dep  on_track
('fl100000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000001',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'ac100000-0000-0000-0000-000000000002',
 'QK502', 'at100000-0000-0000-0000-000000000005', 'C-FQKE',
 'YOW', 'YYZ',
 CURRENT_DATE + INTERVAL '15 hours 45 minutes',
 CURRENT_DATE + INTERVAL '17 hours 10 minutes',
 CURRENT_DATE + INTERVAL '15 hours 43 minutes',
 NULL,
 'on_track', 'C10'),

-- ── AT RISK ───────────────────────────────────────────────────────────────────

-- JZ310  Jazz  DHC-8-400  YUL→YYZ  13:00 arr / 14:30 dep  at_risk
('fl100000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'ac100000-0000-0000-0000-000000000003',
 'JZ310', 'at100000-0000-0000-0000-000000000001', 'C-FJZF',
 'YUL', 'YYZ',
 CURRENT_DATE + INTERVAL '13 hours',
 CURRENT_DATE + INTERVAL '14 hours 30 minutes',
 CURRENT_DATE + INTERVAL '13 hours 08 minutes',
 NULL,
 'at_risk', 'B20'),

-- QK618  Air Canada Express  CRJ-900  YOW→YYZ  17:30 arr / 19:00 dep  at_risk
('fl100000-0000-0000-0000-000000000007',
 'a0000000-0000-0000-0000-000000000001',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'ac100000-0000-0000-0000-000000000002',
 'QK618', 'at100000-0000-0000-0000-000000000002', 'C-FQKG',
 'YOW', 'YYZ',
 CURRENT_DATE + INTERVAL '17 hours 30 minutes',
 CURRENT_DATE + INTERVAL '19 hours',
 CURRENT_DATE + INTERVAL '17 hours 35 minutes',
 NULL,
 'at_risk', 'C30'),

-- ── SCHEDULED ────────────────────────────────────────────────────────────────

-- PD405  Porter  CRJ-200  YUL→YYZ  20:00 arr / 21:30 dep  scheduled
('fl100000-0000-0000-0000-000000000008',
 'a0000000-0000-0000-0000-000000000001',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'ac100000-0000-0000-0000-000000000001',
 'PD405', 'at100000-0000-0000-0000-000000000005', 'C-FPDH',
 'YUL', 'YYZ',
 CURRENT_DATE + INTERVAL '20 hours',
 CURRENT_DATE + INTERVAL '21 hours 30 minutes',
 NULL, NULL,
 'scheduled', 'A5'),

-- JZ901  Jazz  E175  YOW→YYZ  21:15 arr / 22:45 dep  scheduled
('fl100000-0000-0000-0000-000000000009',
 'a0000000-0000-0000-0000-000000000001',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'ac100000-0000-0000-0000-000000000003',
 'JZ901', 'at100000-0000-0000-0000-000000000003', 'C-FJZI',
 'YOW', 'YYZ',
 CURRENT_DATE + INTERVAL '21 hours 15 minutes',
 CURRENT_DATE + INTERVAL '22 hours 45 minutes',
 NULL, NULL,
 'scheduled', 'B22'),

-- ── DELAYED ──────────────────────────────────────────────────────────────────

-- PD777  Porter  ATR-72  YUL→YYZ  10:00 arr / 11:30 dep  delayed (arrived 22 min late)
('fl100000-0000-0000-0000-000000000010',
 'a0000000-0000-0000-0000-000000000001',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'ac100000-0000-0000-0000-000000000001',
 'PD777', 'at100000-0000-0000-0000-000000000004', 'C-FPDJ',
 'YUL', 'YYZ',
 CURRENT_DATE + INTERVAL '10 hours',
 CURRENT_DATE + INTERVAL '11 hours 30 minutes',
 CURRENT_DATE + INTERVAL '10 hours 22 minutes',
 NULL,
 'delayed', 'A9')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Turnaround Events
-- =============================================================================

-- ── PD123 — COMPLETED (all 12 events) ────────────────────────────────────────
INSERT INTO turnaround_events
  (organization_id, flight_id, event_type, event_sequence, logged_at, planned_time, logged_by, notes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'aircraft_arrival',   1, CURRENT_DATE + INTERVAL '6 hours 27 minutes',
   CURRENT_DATE + INTERVAL '6 hours 30 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Arrived 3 min early'),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'door_open',          2, CURRENT_DATE + INTERVAL '6 hours 30 minutes',
   CURRENT_DATE + INTERVAL '6 hours 33 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'deplaning_start',    3, CURRENT_DATE + INTERVAL '6 hours 32 minutes',
   CURRENT_DATE + INTERVAL '6 hours 35 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'deplaning_end',      4, CURRENT_DATE + INTERVAL '6 hours 40 minutes',
   CURRENT_DATE + INTERVAL '6 hours 43 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'cleaning_start',     5, CURRENT_DATE + INTERVAL '6 hours 43 minutes',
   CURRENT_DATE + INTERVAL '6 hours 46 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'cleaning_end',       6, CURRENT_DATE + INTERVAL '6 hours 58 minutes',
   CURRENT_DATE + INTERVAL '7 hours 01 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Transit clean completed'),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'catering_confirmed', 7, CURRENT_DATE + INTERVAL '7 hours 02 minutes',
   CURRENT_DATE + INTERVAL '7 hours 05 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'fueling_confirmed',  8, CURRENT_DATE + INTERVAL '7 hours 05 minutes',
   CURRENT_DATE + INTERVAL '7 hours 10 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'boarding_start',     9, CURRENT_DATE + INTERVAL '7 hours 10 minutes',
   CURRENT_DATE + INTERVAL '7 hours 15 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'boarding_end',      10, CURRENT_DATE + INTERVAL '7 hours 40 minutes',
   CURRENT_DATE + INTERVAL '7 hours 42 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'door_close',        11, CURRENT_DATE + INTERVAL '7 hours 44 minutes',
   CURRENT_DATE + INTERVAL '7 hours 45 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000001',
   'pushback',          12, CURRENT_DATE + INTERVAL '7 hours 58 minutes',
   CURRENT_DATE + INTERVAL '8 hours',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'On-time departure')
ON CONFLICT (flight_id, event_type) DO NOTHING;

-- ── QK456 — COMPLETED (all 12 events) ────────────────────────────────────────
INSERT INTO turnaround_events
  (organization_id, flight_id, event_type, event_sequence, logged_at, planned_time, logged_by, notes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'aircraft_arrival',   1, CURRENT_DATE + INTERVAL '8 hours 58 minutes',
   CURRENT_DATE + INTERVAL '9 hours',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Arrived 2 min early'),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'door_open',          2, CURRENT_DATE + INTERVAL '9 hours 01 minutes',
   CURRENT_DATE + INTERVAL '9 hours 03 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'deplaning_start',    3, CURRENT_DATE + INTERVAL '9 hours 02 minutes',
   CURRENT_DATE + INTERVAL '9 hours 05 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'deplaning_end',      4, CURRENT_DATE + INTERVAL '9 hours 11 minutes',
   CURRENT_DATE + INTERVAL '9 hours 13 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'cleaning_start',     5, CURRENT_DATE + INTERVAL '9 hours 13 minutes',
   CURRENT_DATE + INTERVAL '9 hours 16 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'cleaning_end',       6, CURRENT_DATE + INTERVAL '9 hours 43 minutes',
   CURRENT_DATE + INTERVAL '9 hours 46 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Full clean completed'),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'catering_confirmed', 7, CURRENT_DATE + INTERVAL '9 hours 48 minutes',
   CURRENT_DATE + INTERVAL '9 hours 50 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'fueling_confirmed',  8, CURRENT_DATE + INTERVAL '9 hours 52 minutes',
   CURRENT_DATE + INTERVAL '9 hours 55 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'boarding_start',     9, CURRENT_DATE + INTERVAL '9 hours 57 minutes',
   CURRENT_DATE + INTERVAL '10 hours',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'boarding_end',      10, CURRENT_DATE + INTERVAL '10 hours 15 minutes',
   CURRENT_DATE + INTERVAL '10 hours 17 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'door_close',        11, CURRENT_DATE + INTERVAL '10 hours 18 minutes',
   CURRENT_DATE + INTERVAL '10 hours 20 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000002',
   'pushback',          12, CURRENT_DATE + INTERVAL '10 hours 28 minutes',
   CURRENT_DATE + INTERVAL '10 hours 30 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'On time')
ON CONFLICT (flight_id, event_type) DO NOTHING;

-- ── JZ789 — COMPLETED (all 12 events) ────────────────────────────────────────
INSERT INTO turnaround_events
  (organization_id, flight_id, event_type, event_sequence, logged_at, planned_time, logged_by, notes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'aircraft_arrival',   1, CURRENT_DATE + INTERVAL '11 hours 12 minutes',
   CURRENT_DATE + INTERVAL '11 hours 15 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'door_open',          2, CURRENT_DATE + INTERVAL '11 hours 15 minutes',
   CURRENT_DATE + INTERVAL '11 hours 18 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'deplaning_start',    3, CURRENT_DATE + INTERVAL '11 hours 17 minutes',
   CURRENT_DATE + INTERVAL '11 hours 20 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'deplaning_end',      4, CURRENT_DATE + INTERVAL '11 hours 26 minutes',
   CURRENT_DATE + INTERVAL '11 hours 28 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'cleaning_start',     5, CURRENT_DATE + INTERVAL '11 hours 28 minutes',
   CURRENT_DATE + INTERVAL '11 hours 31 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'cleaning_end',       6, CURRENT_DATE + INTERVAL '11 hours 56 minutes',
   CURRENT_DATE + INTERVAL '11 hours 59 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Full clean — E175'),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'catering_confirmed', 7, CURRENT_DATE + INTERVAL '12 hours 00 minutes',
   CURRENT_DATE + INTERVAL '12 hours 03 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'fueling_confirmed',  8, CURRENT_DATE + INTERVAL '12 hours 04 minutes',
   CURRENT_DATE + INTERVAL '12 hours 07 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'boarding_start',     9, CURRENT_DATE + INTERVAL '12 hours 08 minutes',
   CURRENT_DATE + INTERVAL '12 hours 10 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'boarding_end',      10, CURRENT_DATE + INTERVAL '12 hours 28 minutes',
   CURRENT_DATE + INTERVAL '12 hours 30 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'door_close',        11, CURRENT_DATE + INTERVAL '12 hours 31 minutes',
   CURRENT_DATE + INTERVAL '12 hours 33 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000003',
   'pushback',          12, CURRENT_DATE + INTERVAL '12 hours 43 minutes',
   CURRENT_DATE + INTERVAL '12 hours 45 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'On-time departure')
ON CONFLICT (flight_id, event_type) DO NOTHING;

-- ── PD201 — ON TRACK (first 5 events) ────────────────────────────────────────
INSERT INTO turnaround_events
  (organization_id, flight_id, event_type, event_sequence, logged_at, planned_time, logged_by, notes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000004',
   'aircraft_arrival',   1, CURRENT_DATE + INTERVAL '13 hours 58 minutes',
   CURRENT_DATE + INTERVAL '14 hours',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Arrived 2 min early'),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000004',
   'door_open',          2, CURRENT_DATE + INTERVAL '14 hours 01 minutes',
   CURRENT_DATE + INTERVAL '14 hours 03 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000004',
   'deplaning_start',    3, CURRENT_DATE + INTERVAL '14 hours 02 minutes',
   CURRENT_DATE + INTERVAL '14 hours 05 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000004',
   'deplaning_end',      4, CURRENT_DATE + INTERVAL '14 hours 11 minutes',
   CURRENT_DATE + INTERVAL '14 hours 13 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000004',
   'cleaning_start',     5, CURRENT_DATE + INTERVAL '14 hours 13 minutes',
   CURRENT_DATE + INTERVAL '14 hours 16 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL)
ON CONFLICT (flight_id, event_type) DO NOTHING;

-- ── QK502 — ON TRACK (first 4 events) ────────────────────────────────────────
INSERT INTO turnaround_events
  (organization_id, flight_id, event_type, event_sequence, logged_at, planned_time, logged_by, notes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000005',
   'aircraft_arrival',   1, CURRENT_DATE + INTERVAL '15 hours 43 minutes',
   CURRENT_DATE + INTERVAL '15 hours 45 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000005',
   'door_open',          2, CURRENT_DATE + INTERVAL '15 hours 46 minutes',
   CURRENT_DATE + INTERVAL '15 hours 48 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000005',
   'deplaning_start',    3, CURRENT_DATE + INTERVAL '15 hours 48 minutes',
   CURRENT_DATE + INTERVAL '15 hours 50 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000005',
   'deplaning_end',      4, CURRENT_DATE + INTERVAL '15 hours 57 minutes',
   CURRENT_DATE + INTERVAL '15 hours 58 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL)
ON CONFLICT (flight_id, event_type) DO NOTHING;

-- ── JZ310 — AT RISK (first 3 events) ─────────────────────────────────────────
INSERT INTO turnaround_events
  (organization_id, flight_id, event_type, event_sequence, logged_at, planned_time, logged_by, notes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000006',
   'aircraft_arrival',   1, CURRENT_DATE + INTERVAL '13 hours 08 minutes',
   CURRENT_DATE + INTERVAL '13 hours',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Arrived 8 min late — weather hold at YUL'),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000006',
   'door_open',          2, CURRENT_DATE + INTERVAL '13 hours 12 minutes',
   CURRENT_DATE + INTERVAL '13 hours 03 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000006',
   'deplaning_start',    3, CURRENT_DATE + INTERVAL '13 hours 14 minutes',
   CURRENT_DATE + INTERVAL '13 hours 05 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Slow deplane — mobility assistance pax')
ON CONFLICT (flight_id, event_type) DO NOTHING;

-- ── QK618 — AT RISK (first 2 events) ─────────────────────────────────────────
INSERT INTO turnaround_events
  (organization_id, flight_id, event_type, event_sequence, logged_at, planned_time, logged_by, notes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000007',
   'aircraft_arrival',   1, CURRENT_DATE + INTERVAL '17 hours 35 minutes',
   CURRENT_DATE + INTERVAL '17 hours 30 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Arrived 5 min late — gate conflict'),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000007',
   'door_open',          2, CURRENT_DATE + INTERVAL '17 hours 40 minutes',
   CURRENT_DATE + INTERVAL '17 hours 33 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Delayed — jetbridge issue')
ON CONFLICT (flight_id, event_type) DO NOTHING;

-- ── PD777 — DELAYED (first 2 events) ─────────────────────────────────────────
INSERT INTO turnaround_events
  (organization_id, flight_id, event_type, event_sequence, logged_at, planned_time, logged_by, notes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000010',
   'aircraft_arrival',   1, CURRENT_DATE + INTERVAL '10 hours 22 minutes',
   CURRENT_DATE + INTERVAL '10 hours',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Arrived 22 min late — ATC delay from YUL'),
  ('a0000000-0000-0000-0000-000000000001', 'fl100000-0000-0000-0000-000000000010',
   'door_open',          2, CURRENT_DATE + INTERVAL '10 hours 27 minutes',
   CURRENT_DATE + INTERVAL '10 hours 03 minutes',
   '55130461-ffef-4a68-9e71-10c86013c90c', 'Ground crew delayed — prior gate occupied')
ON CONFLICT (flight_id, event_type) DO NOTHING;

-- =============================================================================
-- Grooming Work Orders (6)
-- =============================================================================
INSERT INTO grooming_work_orders (
  id, organization_id, flight_id, aircraft_type_id,
  cleaning_level, standard_duration_min, actual_duration_min,
  required_agents, status, supervisor_id, notes, started_at, completed_at
)
VALUES

-- 1. PD123 — completed, transit_clean
('gw100000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000001',
 'at100000-0000-0000-0000-000000000001',
 'transit_clean', 15, 15, 3, 'completed',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 'Standard transit clean — within SLA',
 CURRENT_DATE + INTERVAL '6 hours 43 minutes',
 CURRENT_DATE + INTERVAL '6 hours 58 minutes'),

-- 2. QK456 — completed, transit_clean
('gw100000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000002',
 'at100000-0000-0000-0000-000000000002',
 'transit_clean', 12, 30, 4, 'completed',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 'Ran long — passenger debris in rear cabin',
 CURRENT_DATE + INTERVAL '9 hours 13 minutes',
 CURRENT_DATE + INTERVAL '9 hours 43 minutes'),

-- 3. JZ310 — in_progress, full_clean
('gw100000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000006',
 'at100000-0000-0000-0000-000000000001',
 'full_clean', 35, NULL, 4, 'in_progress',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 'Full clean required — overnight inbound config',
 CURRENT_DATE + INTERVAL '13 hours 30 minutes',
 NULL),

-- 4. QK618 — in_progress, full_clean
('gw100000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000007',
 'at100000-0000-0000-0000-000000000002',
 'full_clean', 30, NULL, 3, 'in_progress',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 NULL,
 CURRENT_DATE + INTERVAL '17 hours 55 minutes',
 NULL),

-- 5. PD405 — pending, deep_clean
('gw100000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000008',
 'at100000-0000-0000-0000-000000000005',
 'deep_clean', 65, NULL, 5, 'pending',
 NULL,
 'Scheduled deep clean — 30-day cycle due',
 NULL, NULL),

-- 6. JZ901 — pending, transit_clean
('gw100000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000009',
 'at100000-0000-0000-0000-000000000003',
 'transit_clean', 12, NULL, 2, 'pending',
 NULL, NULL, NULL, NULL)

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Damage Reports (4 at YYZ)
-- =============================================================================
INSERT INTO damage_reports (
  id, organization_id, flight_id, aircraft_registration, station_id,
  damage_location, description, severity, status,
  reported_by, supervisor_id, supervisor_comments, supervisor_reviewed_at,
  manager_id, manager_comments, manager_approved_at,
  airline_notified_at, created_at
)
VALUES

-- 1. Approved — minor
('dr100000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000001',
 'C-FPDA',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'Left main gear door',
 'Minor paint scuff on left main gear door, approximately 5 cm. No structural impact.',
 'minor', 'approved',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 'Reviewed — cosmetic only, does not affect airworthiness.',
 CURRENT_DATE + INTERVAL '8 hours 15 minutes',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 'Approved for record. Porter advised.',
 CURRENT_DATE + INTERVAL '9 hours 00 minutes',
 CURRENT_DATE + INTERVAL '9 hours 05 minutes',
 CURRENT_DATE + INTERVAL '7 hours 30 minutes'),

-- 2. Supervisor reviewed — moderate
('dr100000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000002',
 'C-FQKB',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'Rear cargo door frame',
 'Dent on lower-left edge of rear cargo door frame, roughly 8 cm × 3 cm. Likely caused by loading equipment contact.',
 'moderate', 'supervisor_reviewed',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 'Confirmed dent during walk-around. Equipment contact suspected. Recommend maintenance inspection before next sector.',
 CURRENT_DATE + INTERVAL '10 hours 30 minutes',
 NULL, NULL, NULL, NULL,
 CURRENT_DATE + INTERVAL '9 hours 45 minutes'),

-- 3. Submitted — major
('dr100000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000006',
 'C-FJZF',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'Wing root fairing — right side',
 'Cracked wing root fairing panel approximately 20 cm. Edges lifting slightly. Possible FOD strike on final approach.',
 'major', 'submitted',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 CURRENT_DATE + INTERVAL '13 hours 20 minutes'),

-- 4. Draft — critical
('dr100000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000010',
 'C-FPDJ',
 '615caa01-563a-41e8-b9dd-cefddb6e2e2a',
 'Nose gear strut',
 'Hydraulic fluid seepage visible on nose gear strut. Puddle approximately 15 cm diameter on apron. Aircraft grounded pending maintenance.',
 'critical', 'draft',
 '55130461-ffef-4a68-9e71-10c86013c90c',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 CURRENT_DATE + INTERVAL '10 hours 35 minutes')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Turnaround Alerts (3)
-- =============================================================================
INSERT INTO turnaround_alerts (
  id, organization_id, flight_id, event_type,
  alert_message, is_read, acknowledged_by, acknowledged_at
)
VALUES

-- 1. Unread — PD777 delayed arrival
('ta100000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000010',
 'aircraft_arrival',
 'PD777 arrived 22 min late. Departure at risk — turnaround buffer exceeded. Immediate ramp coordination required.',
 false, NULL, NULL),

-- 2. Unread — JZ310 at risk
('ta100000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000006',
 'door_open',
 'JZ310 door open delayed by 4 min past SLA threshold. Deplaning not yet started. YUL weather hold reduced buffer.',
 false, NULL, NULL),

-- 3. Acknowledged — QK618 gate conflict
('ta100000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 'fl100000-0000-0000-0000-000000000007',
 'aircraft_arrival',
 'QK618 arrival delayed 5 min due to gate C30 occupied by outbound AC683. Jetbridge crew notified.',
 true,
 '55130461-ffef-4a68-9e71-10c86013c90c',
 CURRENT_DATE + INTERVAL '17 hours 38 minutes')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
SET session_replication_role = 'origin';
