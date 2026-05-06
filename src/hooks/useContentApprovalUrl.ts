import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export function useContentApprovalUrl() {
  const { user, isAdmin } = useAuth();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user || isAdmin) {
      setUrl(null);
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('clients')
        .select('content_approval_url')
        .eq('user_id', user.id)
        .maybeSingle();
      if (active) setUrl((data as any)?.content_approval_url ?? null);
    })();
    return () => {
      active = false;
    };
  }, [user, isAdmin]);

  return url;
}
