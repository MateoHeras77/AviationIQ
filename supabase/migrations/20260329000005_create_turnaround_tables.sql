-- Migration: Create turnaround operations tables (flights, events, alerts)
-- Sprint 2 - Phase 1 Schema

-- =============================================================================
-- FLIGHTS
-- =============================================================================
CREATE TABLE flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  airline_client_id UUID NOT NULL REFERENCES airline_clients(id) ON DELETE CASCADE,
  flight_number VARCHAR(10) NOT NULL,
  aircraft_type_id UUID REFERENCES aircraft_types(id) ON DELETE SET NULL,
  aircraft_registration VARCHAR(10),
  origin VARCHAR(4),
  destination VARCHAR(4),
  scheduled_arrival TIMESTAMPTZ,
  scheduled_departure TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  status flight_status NOT NULL DEFAULT 'scheduled',
  gate VARCHAR(10),
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER set_flights_updated_at
  BEFORE UPDATE ON flights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON flights
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON flights
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON flights
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_crud" ON flights
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_read" ON flights
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_insert" ON flights
  FOR INSERT WITH CHECK (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "airline_client_read" ON flights
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'airline_client'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Indexes
CREATE INDEX idx_flights_organization_id ON flights(organization_id);
CREATE INDEX idx_flights_station_id ON flights(station_id);
CREATE INDEX idx_flights_airline_client_id ON flights(airline_client_id);
CREATE INDEX idx_flights_aircraft_type_id ON flights(aircraft_type_id);
CREATE INDEX idx_flights_flight_number ON flights(flight_number);
CREATE INDEX idx_flights_scheduled_arrival ON flights(scheduled_arrival);
CREATE INDEX idx_flights_status ON flights(status);
CREATE INDEX idx_flights_created_by ON flights(created_by);

-- =============================================================================
-- TURNAROUND EVENTS
-- =============================================================================
CREATE TABLE turnaround_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  event_type turnaround_event_type NOT NULL,
  event_sequence INT NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  logged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  planned_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(flight_id, event_type)
);

ALTER TABLE turnaround_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON turnaround_events
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON turnaround_events
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON turnaround_events
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_crud" ON turnaround_events
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_read" ON turnaround_events
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_insert" ON turnaround_events
  FOR INSERT WITH CHECK (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "airline_client_read" ON turnaround_events
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'airline_client'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Indexes
CREATE INDEX idx_turnaround_events_organization_id ON turnaround_events(organization_id);
CREATE INDEX idx_turnaround_events_flight_id ON turnaround_events(flight_id);
CREATE INDEX idx_turnaround_events_event_type ON turnaround_events(event_type);
CREATE INDEX idx_turnaround_events_logged_by ON turnaround_events(logged_by);

-- =============================================================================
-- TURNAROUND ALERTS
-- =============================================================================
CREATE TABLE turnaround_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  event_type turnaround_event_type,
  alert_message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE turnaround_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON turnaround_alerts
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON turnaround_alerts
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON turnaround_alerts
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_crud" ON turnaround_alerts
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_read" ON turnaround_alerts
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Indexes
CREATE INDEX idx_turnaround_alerts_organization_id ON turnaround_alerts(organization_id);
CREATE INDEX idx_turnaround_alerts_flight_id ON turnaround_alerts(flight_id);
CREATE INDEX idx_turnaround_alerts_acknowledged_by ON turnaround_alerts(acknowledged_by);
