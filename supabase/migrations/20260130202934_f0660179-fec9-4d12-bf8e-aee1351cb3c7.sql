-- Corrigir função update_updated_at com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Corrigir função handle_new_user com search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client');
    
    RETURN NEW;
END;
$$;

-- Remover política permissiva de audit_logs e criar uma mais segura
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Criar função para inserir audit logs de forma segura
CREATE OR REPLACE FUNCTION public.insert_audit_log(
    _action TEXT,
    _entity_type TEXT,
    _entity_id TEXT DEFAULT NULL,
    _old_values JSONB DEFAULT NULL,
    _new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (auth.uid(), _action, _entity_type, _entity_id, _old_values, _new_values)
    RETURNING id INTO _log_id;
    
    RETURN _log_id;
END;
$$;

-- Policy para permitir que usuários autenticados insiram seus próprios logs
CREATE POLICY "Authenticated users can insert own audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);