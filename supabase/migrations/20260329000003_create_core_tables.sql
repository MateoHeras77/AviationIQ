-- Migration: Create core tables (organizations, stations, profiles)
-- Sprint 2 - Phase 1 Schema

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Organizations uses id instead of organization_id for tenant isolation
CREATE POLICY "tenant_isolation" ON organizations
  USING (id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON organizations
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "members_read" ON organizations
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') IN ('station_manager', 'supervisor', 'agent', 'airline_client')
    AND id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- =============================================================================
-- STATIONS
-- =============================================================================
CREATE TABLE stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  airport_code VARCHAR(4) NOT NULL,
  airport_name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, airport_code)
);

CREATE TRIGGER set_stations_updated_at
  BEFORE UPDATE ON stations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON stations
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON stations
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON stations
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "staff_read" ON stations
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') IN ('supervisor', 'agent', 'airline_client')
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Indexes
CREATE INDEX idx_stations_organization_id ON stations(organization_id);

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'agent',
  station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON profiles
  USING (organization_id = (select (auth.jwt() ->> 'organization_id')::uuid));

CREATE POLICY "admin_full_access" ON profiles
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'admin'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "station_manager_crud" ON profiles
  FOR ALL USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_read" ON profiles
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "agent_read_own" ON profiles
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND id = (select auth.uid())
  );

CREATE POLICY "agent_read_assigned" ON profiles
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "airline_client_read" ON profiles
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'airline_client'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Indexes
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_station_id ON profiles(station_id);
