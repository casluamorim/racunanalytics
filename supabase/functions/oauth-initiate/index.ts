import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    const { platform, client_id, redirect_uri } = await req.json();

    if (!platform || !client_id || !redirect_uri) {
      return new Response(JSON.stringify({ error: 'Missing platform, client_id, or redirect_uri' }), { status: 400, headers: corsHeaders });
    }

    let authUrl = '';

    if (platform === 'meta') {
      const appId = Deno.env.get('META_APP_ID');
      if (!appId) {
        return new Response(JSON.stringify({ error: 'META_APP_ID not configured' }), { status: 500, headers: corsHeaders });
      }

      // State contains client_id for the callback
      const state = JSON.stringify({ client_id, platform });
      const stateEncoded = btoa(state);

      const scopes = [
        'ads_read',
        'ads_management',
        'business_management',
        'pages_read_engagement',
      ].join(',');

      authUrl = `https://www.facebook.com/v21.0/dialog/oauth?` +
        `client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
        `&state=${encodeURIComponent(stateEncoded)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&response_type=code`;
    } else if (platform === 'google') {
      const clientId = Deno.env.get('GOOGLE_ADS_CLIENT_ID');
      if (!clientId) {
        return new Response(JSON.stringify({ error: 'GOOGLE_ADS_CLIENT_ID not configured' }), { status: 500, headers: corsHeaders });
      }

      const state = JSON.stringify({ client_id, platform });
      const stateEncoded = btoa(state);

      const scopes = 'https://www.googleapis.com/auth/adwords';

      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
        `&state=${encodeURIComponent(stateEncoded)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&response_type=code` +
        `&access_type=offline` +
        `&prompt=consent`;
    } else if (platform === 'tiktok') {
      const appId = Deno.env.get('TIKTOK_APP_ID');
      if (!appId) {
        return new Response(JSON.stringify({ error: 'TIKTOK_APP_ID not configured' }), { status: 500, headers: corsHeaders });
      }

      const state = JSON.stringify({ client_id, platform });
      const stateEncoded = btoa(state);

      authUrl = `https://business-api.tiktok.com/portal/auth?` +
        `app_id=${appId}` +
        `&state=${encodeURIComponent(stateEncoded)}` +
        `&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported platform' }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ url: authUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
