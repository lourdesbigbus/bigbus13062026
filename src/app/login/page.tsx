'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { loginAdminServer, resetPasswordServer } from './actions';
import { Truck, Lock, Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Estados dos inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados de controle de login / recuperação
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Se o administrador já estiver logado, redirecionar direto para o painel
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/admin');
      }
    };
    checkSession();
  }, [router]);

  // Submit de Login via Server Actions (Bypassa Adblocker / Firewall no cliente)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await loginAdminServer(email, password);

      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.session) {
        // Setar a sessão manualmente no cliente
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token!,
          refresh_token: result.session.refresh_token!,
        });

        if (sessionError) throw sessionError;
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Submit de Recuperação de Senha via Server Actions
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await resetPasswordServer(email, window.location.origin);

      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccessMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada e spam.');
      setEmail('');
    } catch (err: any) {
      console.error('Erro ao solicitar redefinição:', err);
      setError(err.message || 'Erro ao enviar e-mail de recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Voltar para Home */}
      <div className="absolute top-6 left-6">
        <a
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Portal</span>
        </a>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative h-28 w-28 drop-shadow-[0_10px_20px_rgba(245,158,11,0.35)] hover:scale-105 transition-transform duration-300">
            <img src="/logo.svg" alt="BigBus Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-extrabold text-3xl tracking-tight text-white uppercase">
              Big<span className="text-accent">Bus</span>
            </h1>
            <p className="text-[10px] tracking-[0.22em] uppercase text-slate-400 -mt-1 font-semibold">
              Painel Administrativo
            </p>
          </div>
        </div>

        {/* Card do Form */}
        <div className="bg-primary-light border border-slate-700/60 rounded-2xl py-8 px-6 sm:px-10 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white">
              {isForgot ? 'Recuperar Senha' : 'Acesse sua Conta'}
            </h2>
            <p className="text-xs text-slate-400">
              {isForgot 
                ? 'Digite seu e-mail para receber o link de redefinição' 
                : 'Insira seu e-mail e senha administrativo para entrar'}
            </p>
          </div>

          {/* Feedback de erro */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start space-x-2.5 text-xs text-left animate-in fade-in duration-200">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Feedback de sucesso */}
          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-start space-x-2.5 text-xs text-left animate-in fade-in duration-200">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {isForgot ? (
            /* Formulário de Recuperação de Senha */
            <form onSubmit={handleResetPassword} className="space-y-4 text-left">
              <div className="flex flex-col space-y-1">
                <label htmlFor="reset-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  E-mail de Cadastro
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="admin@bigbus.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-primary/40 text-white border border-slate-700 pl-10 pr-3 py-2.5 rounded-lg text-sm placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 bg-accent text-primary font-bold hover:bg-accent-hover disabled:opacity-50 py-3.5 rounded-lg text-sm shadow-lg transition-all duration-200 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enviando Link...</span>
                  </>
                ) : (
                  <span>Enviar Link de Recuperação</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          ) : (
            /* Formulário de Login Tradicional */
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              {/* E-mail */}
              <div className="flex flex-col space-y-1">
                <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="admin@bigbus.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-primary/40 text-white border border-slate-700 pl-10 pr-3 py-2.5 rounded-lg text-sm placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="senha" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot(true);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[10px] font-semibold text-accent hover:underline transition-all"
                  >
                    Esqueci a senha
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="senha"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-primary/40 text-white border border-slate-700 pl-10 pr-3 py-2.5 rounded-lg text-sm placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              {/* Botão de Enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 bg-accent text-primary font-bold hover:bg-accent-hover disabled:opacity-50 py-3.5 rounded-lg text-sm shadow-lg transition-all duration-200 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <span>Acessar Painel</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
