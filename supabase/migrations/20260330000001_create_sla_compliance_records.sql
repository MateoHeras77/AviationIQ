-- Migration: Create sla_compliance_records table
-- Sprint 3 — stores pre-calculated SLA compliance results per flight per event
-- Populated by the calculate-sla Edge Function

-- =============================================================================
-- ENUM: compliance_status
-- =============================================================================
CREATE TYPE sla_compliance_status AS ENUM (
  'compliant',
  'at_risk',
  'breached',
  'pending'
);

-- =============================================================================
-- TABLE: sla_compliance_records
-- =============================================================================
CREATE TABLE sla_compliance_records (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  flight_id              UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  turnaround_event_id    UUID REFERENCES turnaround_events(id) ON DELETE SET NULL,
  sla_configuration_id   UUID REFERENCES sla_configurations(id) ON DELETE SET NULL,
  expected_duration_min  INT NOT NULL,
  actual_duration_min    INT,
  compliance_status      sla_compliance_status NOT NULL,
  calculated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at             TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at             TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- One record per (flight, turnaround event) — recalculation replaces via upsert
  UNIQUE(flight_id, turnaround_event_id)
);

CREATE TRIGGER set_sla_compliance_records_updated_at
  BEFORE UPDATE ON sla_compliance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE sla_compliance_records ENABLE ROW LEVEL SECURITY;

-- Tenant isolation: all operations scoped to caller's organization
CREATE POLICY "tenant_isolation_select" ON sla_compliance_records
  FOR SELECT USING (
    organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "tenant_isolation_insert" ON sla_compliance_records
  FOR INSERT WITH CHECK (
    organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "tenant_isolation_update" ON sla_compliance_records
  FOR UPDATE USING (
    organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "tenant_isolation_delete" ON sla_compliance_records
  FOR DELETE USING (
    organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Admin: full access within org
CREATE POLICY "admin_full_access" ON sla_compliance_records
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Station manager: full access within org (needed for reporting)
CREATE POLICY "station_manager_full_access" ON sla_compliance_records
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Supervisor: read-only
CREATE POLICY "supervisor_read" ON sla_compliance_records
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Agent: read-only (agents need to see compliance status on their flights)
CREATE POLICY "agent_read" ON sla_compliance_records
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Airline client: read-only scoped to their org
CREATE POLICY "airline_client_read" ON sla_compliance_records
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'airline_client'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_sla_compliance_records_organization_id    ON sla_compliance_records(organization_id);
CREATE INDEX idx_sla_compliance_records_flight_id          ON sla_compliance_records(flight_id);
CREATE INDEX idx_sla_compliance_records_turnaround_event_id ON sla_compliance_records(turnaround_event_id);
CREATE INDEX idx_sla_compliance_records_sla_configuration_id ON sla_compliance_records(sla_configuration_id);
CREATE INDEX idx_sla_compliance_records_compliance_status  ON sla_compliance_records(compliance_status);
CREATE INDEX idx_sla_compliance_records_calculated_at      ON sla_compliance_records(calculated_at);

-- Composite: common dashboard query — org + flight + status
CREATE INDEX idx_sla_compliance_records_org_flight_status
  ON sla_compliance_records(organization_id, flight_id, compliance_status);
