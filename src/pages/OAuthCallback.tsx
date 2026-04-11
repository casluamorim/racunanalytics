import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autorização...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        setStatus('error');
        setMessage('Parâmetros de callback inválidos.');
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/oauth/callback`;

        const { data, error } = await supabase.functions.invoke('oauth-callback', {
          body: { code, state, redirect_uri: redirectUri },
        });

        if (error) throw error;

        if (data?.success) {
          setStatus('success');
          setMessage(`Conectado com sucesso: ${data.account_name}`);
          setTimeout(() => navigate('/admin/integrations'), 2000);
        } else {
          throw new Error(data?.error || 'Erro desconhecido');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Erro ao processar callback');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {status === 'loading' && <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />}
        {status === 'success' && <CheckCircle className="w-12 h-12 text-chart-positive mx-auto" />}
        {status === 'error' && <XCircle className="w-12 h-12 text-destructive mx-auto" />}
        <p className="text-lg font-medium">{message}</p>
        {status === 'error' && (
          <button
            onClick={() => navigate('/admin/integrations')}
            className="text-primary hover:underline text-sm"
          >
            Voltar para Integrações
          </button>
        )}
      </div>
    </div>
  );
}
