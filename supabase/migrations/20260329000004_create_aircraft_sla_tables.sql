-- Migration: Create aircraft types, airline clients, and SLA configuration tables
-- Sprint 2 - Phase 1 Schema

-- =============================================================================
-- AIRCRAFT TYPES
-- =============================================================================
CREATE TABLE aircraft_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  name TEXT NOT NULL,
  manufacturer TEXT,
  category TEXT,
  transit_clean_duration_min INT,
  full_clean_duration_min INT,
  deep_clean_duration_min INT,
  default_turnaround_min INT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, code)
);

CREATE TRIGGER set_aircraft_types_updated_at
  BEFORE UPDATE ON aircraft_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE aircraft_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON aircraft_types
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON aircraft_types
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON aircraft_types
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "staff_read" ON aircraft_types
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') IN ('supervisor', 'agent', 'airline_client')
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Indexes
CREATE INDEX idx_aircraft_types_organization_id ON aircraft_types(organization_id);

-- =============================================================================
-- AIRLINE CLIENTS
-- =============================================================================
CREATE TABLE airline_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code VARCHAR(2) NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  safety_contact_email TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, code)
);

CREATE TRIGGER set_airline_clients_updated_at
  BEFORE UPDATE ON airline_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE airline_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON airline_clients
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON airline_clients
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON airline_clients
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "staff_read" ON airline_clients
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') IN ('supervisor', 'agent')
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "airline_client_read_own" ON airline_clients
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'airline_client'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Indexes
CREATE INDEX idx_airline_clients_organization_id ON airline_clients(organization_id);

-- =============================================================================
-- SLA CONFIGURATIONS
-- =============================================================================
CREATE TABLE sla_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  airline_client_id UUID NOT NULL REFERENCES airline_clients(id) ON DELETE CASCADE,
  event_type turnaround_event_type NOT NULL,
  max_duration_minutes INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, airline_client_id, event_type)
);

CREATE TRIGGER set_sla_configurations_updated_at
  BEFORE UPDATE ON sla_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE sla_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON sla_configurations
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON sla_configurations
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON sla_configurations
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_read" ON sla_configurations
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "airline_client_read" ON sla_configurations
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'airline_client'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Indexes
CREATE INDEX idx_sla_configurations_organization_id ON sla_configurations(organization_id);
CREATE INDEX idx_sla_configurations_airline_client_id ON sla_configurations(airline_client_id);
