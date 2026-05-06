import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function useContentApprovalUrl() {
  const { user, isAdmin } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || isAdmin) {
      setUrl(null);
      setClientId(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('clients')
        .select('id, content_approval_url')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!active) return;
      const raw = (data as any)?.content_approval_url ?? null;
      setUrl(raw && isValidHttpUrl(raw) ? raw : null);
      setClientId((data as any)?.id ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, isAdmin]);

  const logAccess = useCallback(async () => {
    if (!url || !clientId) return;
    try {
      await supabase.rpc('insert_audit_log', {
        _action: 'content_approval_access',
        _entity_type: 'client',
        _entity_id: clientId,
        _new_values: { url },
      });
    } catch (err) {
      console.error('Failed to log content approval access:', err);
    }
  }, [url, clientId]);

  return { url, loading, logAccess, isValid: !!url };
}
