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
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    const { code, state, redirect_uri } = await req.json();

    if (!code || !state) {
      return new Response(JSON.stringify({ error: 'Missing code or state' }), { status: 400, headers: corsHeaders });
    }

    let stateData: { client_id: string; platform: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid state' }), { status: 400, headers: corsHeaders });
    }

    const { client_id, platform } = stateData;

    // Use service role for writing to platform_connections
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (platform === 'meta') {
      const appId = Deno.env.get('META_APP_ID')!;
      const appSecret = Deno.env.get('META_APP_SECRET')!;

      // Exchange code for access token
      const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?` +
        `client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
        `&client_secret=${appSecret}` +
        `&code=${code}`;

      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        return new Response(JSON.stringify({ error: tokenData.error.message }), { status: 400, headers: corsHeaders });
      }

      // Exchange for long-lived token
      const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?` +
        `grant_type=fb_exchange_token` +
        `&client_id=${appId}` +
        `&client_secret=${appSecret}` +
        `&fb_exchange_token=${tokenData.access_token}`;

      const longLivedRes = await fetch(longLivedUrl);
      const longLivedData = await longLivedRes.json();

      const accessToken = longLivedData.access_token || tokenData.access_token;
      const expiresIn = longLivedData.expires_in || 5184000; // ~60 days

      // Get ad accounts
      const accountsRes = await fetch(
        `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_id&access_token=${accessToken}`
      );
      const accountsData = await accountsRes.json();

      const adAccount = accountsData.data?.[0];
      const accountId = adAccount?.account_id || 'unknown';
      const accountName = adAccount?.name || 'Meta Ads';

      const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      // Upsert connection
      const { error: upsertError } = await supabaseAdmin
        .from('platform_connections')
        .upsert(
          {
            client_id,
            platform: 'meta',
            account_id: accountId,
            account_name: accountName,
            access_token: accessToken,
            token_expires_at: tokenExpiresAt,
            status: 'connected',
            last_sync_at: new Date().toISOString(),
          },
          { onConflict: 'client_id,platform' }
        );

      if (upsertError) {
        // If unique constraint doesn't exist, try delete + insert
        await supabaseAdmin
          .from('platform_connections')
          .delete()
          .eq('client_id', client_id)
          .eq('platform', 'meta');

        const { error: insertError } = await supabaseAdmin
          .from('platform_connections')
          .insert({
            client_id,
            platform: 'meta',
            account_id: accountId,
            account_name: accountName,
            access_token: accessToken,
            token_expires_at: tokenExpiresAt,
            status: 'connected',
            last_sync_at: new Date().toISOString(),
          });

        if (insertError) {
          return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: corsHeaders });
        }
      }

      // Audit log
      await supabaseAdmin.rpc('insert_audit_log', {
        _action: 'oauth_connected',
        _entity_type: 'platform_connection',
        _entity_id: client_id,
        _new_values: { platform: 'meta', account_id: accountId },
      });

      return new Response(JSON.stringify({ success: true, account_name: accountName }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Google and TikTok placeholders - same pattern
    if (platform === 'google') {
      const clientId = Deno.env.get('GOOGLE_ADS_CLIENT_ID')!;
      const clientSecret = Deno.env.get('GOOGLE_ADS_CLIENT_SECRET')!;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        return new Response(JSON.stringify({ error: tokenData.error_description || tokenData.error }), { status: 400, headers: corsHeaders });
      }

      await supabaseAdmin
        .from('platform_connections')
        .delete()
        .eq('client_id', client_id)
        .eq('platform', 'google');

      await supabaseAdmin
        .from('platform_connections')
        .insert({
          client_id,
          platform: 'google',
          account_id: 'pending',
          account_name: 'Google Ads',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString(),
          status: 'connected',
          last_sync_at: new Date().toISOString(),
        });

      return new Response(JSON.stringify({ success: true, account_name: 'Google Ads' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (platform === 'tiktok') {
      const appId = Deno.env.get('TIKTOK_APP_ID')!;
      const appSecret = Deno.env.get('TIKTOK_APP_SECRET')!;

      const tokenRes = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: appId,
          secret: appSecret,
          auth_code: code,
        }),
      });

      const tokenData = await tokenRes.json();

      if (tokenData.code !== 0) {
        return new Response(JSON.stringify({ error: tokenData.message }), { status: 400, headers: corsHeaders });
      }

      const data = tokenData.data;

      await supabaseAdmin
        .from('platform_connections')
        .delete()
        .eq('client_id', client_id)
        .eq('platform', 'tiktok');

      await supabaseAdmin
        .from('platform_connections')
        .insert({
          client_id,
          platform: 'tiktok',
          account_id: data.advertiser_ids?.[0] || 'unknown',
          account_name: 'TikTok Ads',
          access_token: data.access_token,
          token_expires_at: new Date(Date.now() + 86400 * 1000).toISOString(),
          status: 'connected',
          last_sync_at: new Date().toISOString(),
        });

      return new Response(JSON.stringify({ success: true, account_name: 'TikTok Ads' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unsupported platform' }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
