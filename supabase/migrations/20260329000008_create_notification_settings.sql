-- Migration: Create notification settings table
-- Sprint 2 - Phase 1 Schema

CREATE TABLE notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type turnaround_event_type NOT NULL,
  channel notification_channel NOT NULL,
  recipient_role user_role NOT NULL,
  station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
  threshold_minutes INT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER set_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON notification_settings
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON notification_settings
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON notification_settings
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_read" ON notification_settings
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Indexes
CREATE INDEX idx_notification_settings_organization_id ON notification_settings(organization_id);
CREATE INDEX idx_notification_settings_station_id ON notification_settings(station_id);
