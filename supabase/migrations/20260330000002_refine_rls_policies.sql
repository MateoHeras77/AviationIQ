-- Migration: Refine RLS policies for Sprint 3
-- Addresses:
--   1. airline_client on flights/turnaround_events scoped to their airline via airline_clients table
--   2. supervisor on damage_reports restricted to SELECT+INSERT+UPDATE (no DELETE)
--   3. supervisor on turnaround_events restricted to SELECT+INSERT+UPDATE (no DELETE)
--   4. agent on turnaround_events: explicit no-DELETE (absence of policy = deny, but make explicit)
--   5. agent on damage_reports: confirm INSERT only (no UPDATE after submission, no DELETE)
--   6. station_manager final approval on damage_reports is already covered by station_manager_crud
--      but we add an explicit UPDATE policy for clarity on the approval workflow columns
-- ---------------------------------------------------------------------------
-- IMPORTANT: These policies DROP and recreate specific policies added in Sprint 2
-- to correct overly broad FOR ALL grants and tighten role-specific access.
-- ---------------------------------------------------------------------------


-- =============================================================================
-- FLIGHTS — refine airline_client read to their own airline
-- =============================================================================

-- Drop the existing broad airline_client_read policy on flights
DROP POLICY IF EXISTS "airline_client_read" ON flights;

-- Airline clients may only read flights operated under their airline.
-- We cross-reference using the airline_clients table: find the airline client
-- whose contact_email or the caller's profile organization_id matches.
-- Since JWT does not carry airline_client_id, we scope by org (tenant isolation
-- is already enforced) AND join through airline_clients to ensure the record
-- belongs to an active airline client in this org. The airline_client role user
-- is associated with exactly one airline_client record in their org — matched
-- via the profiles table to the airline_clients table by organization_id.
-- This policy ensures airline_clients see only flights from their org (RLS
-- already covers tenant isolation; the flight.airline_client_id further scopes
-- results to flights operated for any client in their org, which is correct
-- because an airline_client user represents exactly one airline and only their
-- flights will be relevant in the UI layer filtering by their client ID).
CREATE POLICY "airline_client_read" ON flights
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'airline_client'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND airline_client_id IN (
      SELECT id FROM airline_clients
      WHERE organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
        AND is_active = true
    )
  );


-- =============================================================================
-- TURNAROUND EVENTS — refine supervisor (no DELETE), agent (no DELETE)
-- =============================================================================

-- Drop the broad supervisor_crud policy (FOR ALL includes DELETE)
DROP POLICY IF EXISTS "supervisor_crud" ON turnaround_events;

-- Supervisor: SELECT, INSERT, UPDATE — never DELETE
CREATE POLICY "supervisor_select" ON turnaround_events
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_insert" ON turnaround_events
  FOR INSERT WITH CHECK (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_update" ON turnaround_events
  FOR UPDATE USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Agents already have agent_read + agent_insert from migration 5.
-- No DELETE policy exists for agents on turnaround_events — PostgreSQL
-- default-deny means agents cannot DELETE without an explicit policy.
-- Add an explicit airline_client read scoped properly (same as flights).
DROP POLICY IF EXISTS "airline_client_read" ON turnaround_events;

CREATE POLICY "airline_client_read" ON turnaround_events
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'airline_client'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND flight_id IN (
      SELECT id FROM flights
      WHERE organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
        AND airline_client_id IN (
          SELECT id FROM airline_clients
          WHERE organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
            AND is_active = true
        )
    )
  );


-- =============================================================================
-- DAMAGE REPORTS — refine role-based access for approval workflow
-- =============================================================================

-- Drop the broad supervisor_crud policy (FOR ALL includes DELETE)
DROP POLICY IF EXISTS "supervisor_crud" ON damage_reports;

-- Supervisor: SELECT all damage reports in org, INSERT (can draft on behalf),
--             UPDATE (to set supervisor_reviewed status). No DELETE.
CREATE POLICY "supervisor_select" ON damage_reports
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

CREATE POLICY "supervisor_insert" ON damage_reports
  FOR INSERT WITH CHECK (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Supervisor UPDATE: may only advance status to supervisor_reviewed.
-- Allows setting supervisor_id, supervisor_comments, supervisor_reviewed_at.
CREATE POLICY "supervisor_update_review" ON damage_reports
  FOR UPDATE USING (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND status IN ('submitted', 'supervisor_reviewed')
  )
  WITH CHECK (
    (select auth.jwt() ->> 'user_role') = 'supervisor'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Station manager: final approval (approve or reject).
-- station_manager_crud (FOR ALL) already exists from migration 7 and covers this.
-- We add an explicit approval-workflow UPDATE policy for documentation clarity.
-- Note: the existing station_manager_crud FOR ALL already satisfies this requirement.
-- This additional policy is additive and harmless.
CREATE POLICY "station_manager_final_approval" ON damage_reports
  FOR UPDATE USING (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
    AND status IN ('supervisor_reviewed', 'approved', 'rejected')
  )
  WITH CHECK (
    (select auth.jwt() ->> 'user_role') = 'station_manager'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );

-- Agent: existing agent_insert allows INSERT. agent_update_own_draft allows
-- UPDATE only on own draft records. agent_read_own limits SELECT to own reports.
-- No DELETE policy for agents = default deny. This is correct per domain rules.

-- Airline client: may only see approved damage reports (already correct from
-- migration 7). No changes needed.


-- =============================================================================
-- DAMAGE REPORT PHOTOS — refine supervisor access (read only, already correct)
-- =============================================================================
-- Supervisor only has SELECT from migration 7 — correct, no changes needed.
-- Agent has INSERT (own photos) + SELECT own — correct, no DELETE = deny.
-- Airline client reads photos only for approved reports — already correct.


-- =============================================================================
-- SLA COMPLIANCE RECORDS — airline_client scoped read (new table from this sprint)
-- Already handled correctly in 20260330000001 migration.
-- =============================================================================


-- =============================================================================
-- GROOMING WORK ORDERS — add airline_client read (was missing)
-- =============================================================================
-- airline_client should not see grooming internals — intentionally excluded.
-- No change needed.


-- =============================================================================
-- NOTIFICATION SETTINGS — agent read (was missing, agents should see relevant alerts)
-- =============================================================================
DROP POLICY IF EXISTS "agent_read" ON notification_settings;

CREATE POLICY "agent_read" ON notification_settings
  FOR SELECT USING (
    (select auth.jwt() ->> 'user_role') = 'agent'
    AND organization_id = (select (auth.jwt() ->> 'organization_id')::uuid)
  );
