-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Enum para plataformas de anúncios
CREATE TYPE public.ad_platform AS ENUM ('meta', 'google', 'tiktok');

-- Enum para status de conexão
CREATE TYPE public.connection_status AS ENUM ('connected', 'expired', 'error', 'disconnected');

-- Tabela de perfis (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    whatsapp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de roles (separada por segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, role)
);

-- Tabela de clientes (informações específicas do cliente)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    admin_whatsapp TEXT,
    monthly_goal DECIMAL(15, 2),
    weekly_report_enabled BOOLEAN DEFAULT true,
    notes TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de conexões de plataformas
CREATE TABLE public.platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    platform ad_platform NOT NULL,
    account_id TEXT NOT NULL,
    account_name TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    status connection_status DEFAULT 'disconnected' NOT NULL,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (client_id, platform, account_id)
);

-- Tabela de cache de métricas
CREATE TABLE public.metrics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    platform ad_platform NOT NULL,
    campaign_id TEXT,
    campaign_name TEXT,
    date DATE NOT NULL,
    spend DECIMAL(15, 2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(10, 4) DEFAULT 0,
    cpc DECIMAL(10, 4) DEFAULT 0,
    cpm DECIMAL(10, 4) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    cost_per_conversion DECIMAL(10, 4),
    conversion_value DECIMAL(15, 2),
    roas DECIMAL(10, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de logs de relatórios semanais
CREATE TABLE public.weekly_report_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    sent_to_client BOOLEAN DEFAULT false,
    sent_to_admin BOOLEAN DEFAULT false,
    client_whatsapp TEXT,
    admin_whatsapp TEXT,
    report_data JSONB,
    status TEXT NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de logs de auditoria
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de arquivos do cliente
CREATE TABLE public.client_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX idx_metrics_cache_client_date ON public.metrics_cache(client_id, date);
CREATE INDEX idx_metrics_cache_platform ON public.metrics_cache(platform);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX idx_platform_connections_client ON public.platform_connections(client_id);
CREATE INDEX idx_weekly_report_logs_client ON public.weekly_report_logs(client_id);

-- Função para verificar role do usuário
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Função para obter client_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_client_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.clients WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER platform_connections_updated_at
    BEFORE UPDATE ON public.platform_connections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER metrics_cache_updated_at
    BEFORE UPDATE ON public.metrics_cache
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger para criar perfil e role automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    -- Por padrão, novos usuários são clientes
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_report_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies para profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para user_roles
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para clients
CREATE POLICY "Clients can view own data"
    ON public.clients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all clients"
    ON public.clients FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can update own basic info"
    ON public.clients FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all clients"
    ON public.clients FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para platform_connections
CREATE POLICY "Clients can view own connections"
    ON public.platform_connections FOR SELECT
    USING (client_id = public.get_user_client_id(auth.uid()));

CREATE POLICY "Admins can manage all connections"
    ON public.platform_connections FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para metrics_cache
CREATE POLICY "Clients can view own metrics"
    ON public.metrics_cache FOR SELECT
    USING (client_id = public.get_user_client_id(auth.uid()));

CREATE POLICY "Admins can view all metrics"
    ON public.metrics_cache FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage metrics"
    ON public.metrics_cache FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para weekly_report_logs
CREATE POLICY "Clients can view own report logs"
    ON public.weekly_report_logs FOR SELECT
    USING (client_id = public.get_user_client_id(auth.uid()));

CREATE POLICY "Admins can manage all report logs"
    ON public.weekly_report_logs FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para audit_logs (apenas admin)
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- RLS Policies para client_files
CREATE POLICY "Clients can view own files"
    ON public.client_files FOR SELECT
    USING (client_id = public.get_user_client_id(auth.uid()));

CREATE POLICY "Admins can manage all files"
    ON public.client_files FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));