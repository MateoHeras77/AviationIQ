-- Migration: Create grooming management tables
-- Sprint 2 - Phase 1 Schema

-- =============================================================================
-- GROOMING WORK ORDERS
-- =============================================================================
CREATE TABLE grooming_work_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  aircraft_type_id UUID REFERENCES aircraft_types(id) ON DELETE SET NULL,
  cleaning_level cleaning_level NOT NULL,
  standard_duration_min INT NOT NULL,
  actual_duration_min INT,
  required_agents INT NOT NULL DEFAULT 1,
  status grooming_work_order_status NOT NULL DEFAULT 'pending',
  supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER set_grooming_work_orders_updated_at
  BEFORE UPDATE ON grooming_work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE grooming_work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON grooming_work_orders
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON grooming_work_orders
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON grooming_work_orders
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_crud" ON grooming_work_orders
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_read" ON grooming_work_orders
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_update_assigned" ON grooming_work_orders
  FOR UPDATE USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Indexes
CREATE INDEX idx_grooming_work_orders_organization_id ON grooming_work_orders(organization_id);
CREATE INDEX idx_grooming_work_orders_flight_id ON grooming_work_orders(flight_id);
CREATE INDEX idx_grooming_work_orders_status ON grooming_work_orders(status);
CREATE INDEX idx_grooming_work_orders_aircraft_type_id ON grooming_work_orders(aircraft_type_id);
CREATE INDEX idx_grooming_work_orders_supervisor_id ON grooming_work_orders(supervisor_id);

-- =============================================================================
-- GROOMING ASSIGNMENTS
-- =============================================================================
CREATE TABLE grooming_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES grooming_work_orders(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_time TIMESTAMPTZ,
  completion_time TIMESTAMPTZ,
  duration_minutes INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER set_grooming_assignments_updated_at
  BEFORE UPDATE ON grooming_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE grooming_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON grooming_assignments
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON grooming_assignments
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON grooming_assignments
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_crud" ON grooming_assignments
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_read_own" ON grooming_assignments
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND agent_id = (select auth.uid())
  );

CREATE POLICY "agent_insert" ON grooming_assignments
  FOR INSERT WITH CHECK (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND agent_id = (select auth.uid())
  );

CREATE POLICY "agent_update_own" ON grooming_assignments
  FOR UPDATE USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND agent_id = (select auth.uid())
  );

-- Indexes
CREATE INDEX idx_grooming_assignments_organization_id ON grooming_assignments(organization_id);
CREATE INDEX idx_grooming_assignments_work_order_id ON grooming_assignments(work_order_id);
CREATE INDEX idx_grooming_assignments_agent_id ON grooming_assignments(agent_id);
