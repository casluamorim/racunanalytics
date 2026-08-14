-- 1. audit_logs: remove direct insert path (forge/pollution). Only SECURITY DEFINER fn / service role.
DROP POLICY IF EXISTS "Authenticated users can insert own audit logs" ON public.audit_logs;
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- 2. client_files: explicit, scoped insert policy for clients
DROP POLICY IF EXISTS "Clients can upload own files" ON public.client_files;
CREATE POLICY "Clients can upload own files"
  ON public.client_files FOR INSERT TO authenticated
  WITH CHECK (
    client_id = public.get_user_client_id(auth.uid())
    AND uploaded_by = auth.uid()
  );

-- 3. platform_connections: never expose OAuth tokens to clients
DROP POLICY IF EXISTS "Clients can view own connections" ON public.platform_connections;
REVOKE SELECT ON public.platform_connections FROM anon;

CREATE OR REPLACE VIEW public.client_platform_connections
WITH (security_invoker = off) AS
  SELECT id, client_id, platform, account_id, account_name, status, last_sync_at, created_at, updated_at
  FROM public.platform_connections
  WHERE client_id = public.get_user_client_id(auth.uid())
     OR public.has_role(auth.uid(), 'admin');
GRANT SELECT ON public.client_platform_connections TO authenticated;

-- 4. weekly_report_logs: hide admin whatsapp from clients
DROP POLICY IF EXISTS "Clients can view own report logs" ON public.weekly_report_logs;
REVOKE SELECT ON public.weekly_report_logs FROM anon;

CREATE OR REPLACE VIEW public.client_weekly_report_logs
WITH (security_invoker = off) AS
  SELECT id, client_id, sent_to_client, sent_to_admin, report_data, status, sent_at
  FROM public.weekly_report_logs
  WHERE client_id = public.get_user_client_id(auth.uid());
GRANT SELECT ON public.client_weekly_report_logs TO authenticated;

-- 5. Lock down SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_user_client_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_client_id(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.insert_audit_log(text, text, text, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.insert_audit_log(text, text, text, jsonb, jsonb) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;