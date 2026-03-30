-- Migration: Create damage report tables
-- Sprint 2 - Phase 1 Schema

-- =============================================================================
-- DAMAGE REPORTS
-- =============================================================================
CREATE TABLE damage_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  flight_id UUID REFERENCES flights(id) ON DELETE SET NULL,
  aircraft_registration VARCHAR(10),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  damage_location TEXT NOT NULL,
  description TEXT NOT NULL,
  severity damage_severity NOT NULL,
  status damage_report_status NOT NULL DEFAULT 'draft',
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  supervisor_comments TEXT,
  supervisor_reviewed_at TIMESTAMPTZ,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  manager_comments TEXT,
  manager_approved_at TIMESTAMPTZ,
  airline_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER set_damage_reports_updated_at
  BEFORE UPDATE ON damage_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE damage_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON damage_reports
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON damage_reports
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON damage_reports
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_crud" ON damage_reports
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_read_own" ON damage_reports
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND reported_by = (select auth.uid())
  );

CREATE POLICY "agent_insert" ON damage_reports
  FOR INSERT WITH CHECK (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_update_own_draft" ON damage_reports
  FOR UPDATE USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND reported_by = (select auth.uid())
    AND status = 'draft'
  );

CREATE POLICY "airline_client_read_approved" ON damage_reports
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'airline_client'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND status = 'approved'
  );

-- Indexes
CREATE INDEX idx_damage_reports_organization_id ON damage_reports(organization_id);
CREATE INDEX idx_damage_reports_flight_id ON damage_reports(flight_id);
CREATE INDEX idx_damage_reports_station_id ON damage_reports(station_id);
CREATE INDEX idx_damage_reports_status ON damage_reports(status);
CREATE INDEX idx_damage_reports_reported_by ON damage_reports(reported_by);
CREATE INDEX idx_damage_reports_supervisor_id ON damage_reports(supervisor_id);
CREATE INDEX idx_damage_reports_manager_id ON damage_reports(manager_id);

-- =============================================================================
-- DAMAGE REPORT PHOTOS
-- =============================================================================
CREATE TABLE damage_report_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  damage_report_id UUID NOT NULL REFERENCES damage_reports(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gps_latitude DECIMAL(10, 7),
  gps_longitude DECIMAL(10, 7),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE damage_report_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON damage_report_photos
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON damage_report_photos
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON damage_report_photos
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_read" ON damage_report_photos
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_insert" ON damage_report_photos
  FOR INSERT WITH CHECK (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND uploaded_by = (select auth.uid())
  );

CREATE POLICY "agent_read_own" ON damage_report_photos
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND uploaded_by = (select auth.uid())
  );

CREATE POLICY "airline_client_read_approved" ON damage_report_photos
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'airline_client'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND damage_report_id IN (
      SELECT id FROM damage_reports
      WHERE status = 'approved'
      AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    )
  );

-- Indexes
CREATE INDEX idx_damage_report_photos_organization_id ON damage_report_photos(organization_id);
CREATE INDEX idx_damage_report_photos_damage_report_id ON damage_report_photos(damage_report_id);
CREATE INDEX idx_damage_report_photos_uploaded_by ON damage_report_photos(uploaded_by);
