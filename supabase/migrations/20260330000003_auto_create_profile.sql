-- Migration: Auto-create profile row on Supabase Auth user signup
-- Fires AFTER INSERT on auth.users to create a matching profiles row.
-- Handles three scenarios for organization_id:
--   1. Explicitly set in raw_app_meta_data → use it directly
--   2. Not set, but exactly 1 organization exists → use that one (dev/demo convenience)
--   3. Not set, multiple orgs → skip (admin will assign manually via profiles table)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_organization_id UUID;
  v_org_count       INT;
BEGIN
  -- Resolve organization_id from app metadata
  v_organization_id := (NEW.raw_app_meta_data ->> 'organization_id')::uuid;

  IF v_organization_id IS NULL THEN
    -- Fall back: if there is exactly one org in the system, assign automatically
    SELECT COUNT(*), MIN(id)
      INTO v_org_count, v_organization_id
      FROM public.organizations;

    IF v_org_count <> 1 THEN
      -- Ambiguous — admin must assign manually; do not create profile row
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id,
    organization_id,
    email,
    full_name,
    role,
    avatar_url
  )
  VALUES (
    NEW.id,
    v_organization_id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      (NEW.raw_app_meta_data ->> 'user_role')::user_role,
      'agent'
    ),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Attach the trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
