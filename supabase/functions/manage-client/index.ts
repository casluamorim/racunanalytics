import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization')!

    // Client with user's token to verify admin
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Admin client with service role
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Check if user is admin
    const { data: isAdmin } = await adminClient.rpc('has_role', { _user_id: user.id, _role: 'admin' })
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, ...payload } = await req.json()

    if (action === 'create') {
      const { email, password, fullName, companyName, whatsapp, adminWhatsapp, monthlyGoal, notes, weeklyReportEnabled, contentApprovalUrl } = payload

      // Create auth user via admin API (doesn't affect current session)
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      })

      if (createError) throw createError
      if (!newUser.user) throw new Error('Falha ao criar usuário')

      const userId = newUser.user.id

      // Update profile with whatsapp
      if (whatsapp) {
        await adminClient.from('profiles').update({ whatsapp }).eq('id', userId)
      }

      // Create client record
      const { error: clientError } = await adminClient.from('clients').insert({
        user_id: userId,
        company_name: companyName,
        admin_whatsapp: adminWhatsapp || null,
        monthly_goal: monthlyGoal || null,
        notes: notes || null,
        weekly_report_enabled: weeklyReportEnabled ?? true,
        content_approval_url: contentApprovalUrl || null,
      })

      if (clientError) throw clientError

      // Log the action
      await adminClient.rpc('insert_audit_log', {
        _action: 'create_client',
        _entity_type: 'client',
        _entity_id: userId,
        _new_values: { email, fullName, companyName },
      })

      return new Response(JSON.stringify({ success: true, userId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update') {
      const { clientId, userId: targetUserId, fullName, companyName, whatsapp, adminWhatsapp, monthlyGoal, notes, weeklyReportEnabled, contentApprovalUrl } = payload

      await adminClient.from('profiles').update({
        full_name: fullName,
        whatsapp: whatsapp || null,
      }).eq('id', targetUserId)

      const { error: clientError } = await adminClient.from('clients').update({
        company_name: companyName,
        admin_whatsapp: adminWhatsapp || null,
        monthly_goal: monthlyGoal || null,
        notes: notes || null,
        weekly_report_enabled: weeklyReportEnabled,
        content_approval_url: contentApprovalUrl || null,
      }).eq('id', clientId)

      if (clientError) throw clientError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      const { clientId, userId: targetUserId } = payload

      const { error: clientError } = await adminClient.from('clients').delete().eq('id', clientId)
      if (clientError) throw clientError

      // Optionally delete the auth user too
      await adminClient.auth.admin.deleteUser(targetUserId)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
