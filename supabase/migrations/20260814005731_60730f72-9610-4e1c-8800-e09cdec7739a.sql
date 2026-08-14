-- Replace definer views with invoker views + column-level grants so OAuth tokens
-- and internal admin phone numbers are unreachable from the client API.

DROP VIEW IF EXISTS public.client_platform_connections;
DROP VIEW IF EXISTS public.client_weekly_report_logs;

-- platform_connections: authenticated may read only non-secret columns
REVOKE SELECT ON public.platform_connections FROM authenticated;
GRANT SELECT (id, client_id, platform, account_id, account_name, status,
              token_expires_at, last_sync_at, created_at, updated_at)
  ON public.platform_connections TO authenticated;
GRANT ALL ON public.platform_connections TO service_role;

CREATE POLICY "Clients can view own connections"
  ON public.platform_connections FOR SELECT TO authenticated
  USING (client_id = public.get_user_client_id(auth.uid()));

CREATE VIEW public.client_platform_connections
WITH (security_invoker = on) AS
  SELECT id, client_id, platform, account_id, account_name, status,
         token_expires_at, last_sync_at, created_at, updated_at
  FROM public.platform_connections;
GRANT SELECT ON public.client_platform_connections TO authenticated;

-- weekly_report_logs: admin_whatsapp is never readable through the API
REVOKE SELECT ON public.weekly_report_logs FROM authenticated;
GRANT SELECT (id, client_id, sent_to_client, sent_to_admin, client_whatsapp,
              report_data, status, error_message, sent_at)
  ON public.weekly_report_logs TO authenticated;
GRANT ALL ON public.weekly_report_logs TO service_role;

CREATE POLICY "Clients can view own report logs"
  ON public.weekly_report_logs FOR SELECT TO authenticated
  USING (client_id = public.get_user_client_id(auth.uid()));

CREATE VIEW public.client_weekly_report_logs
WITH (security_invoker = on) AS
  SELECT id, client_id, sent_to_client, sent_to_admin, report_data, status, sent_at
  FROM public.weekly_report_logs;
GRANT SELECT ON public.client_weekly_report_logs TO authenticated;

-- Audit trail can only be written server-side
REVOKE ALL ON FUNCTION public.insert_audit_log(text, text, text, jsonb, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.insert_audit_log(text, text, text, jsonb, jsonb) TO service_role;