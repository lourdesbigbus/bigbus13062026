'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Truck, Lock, Mail, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Estados dos inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verificar o role do perfil antes de permitir entrada como admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        // Se o perfil não existir na tabela (ex: primeiro login manual via console),
        // mas as credenciais de auth são válidas, vamos permitir entrada, mas avisar
        console.warn('Perfil de banco de dados não encontrado, mas autenticação foi bem-sucedida.');
      }

      if (profile && profile.role !== 'admin') {
        // Logout para usuários não administradores que tentam entrar no painel
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Apenas administradores podem acessar esta área.');
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
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="bg-accent p-3.5 rounded-xl flex items-center justify-center shadow-lg">
            <Truck className="h-7 w-7 text-primary" />
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
            <h2 className="text-lg font-bold text-white">Acesse sua Conta</h2>
            <p className="text-xs text-slate-400">Insira seu e-mail e senha administrativo para entrar</p>
          </div>

          {/* Feedback de erro */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start space-x-2.5 text-xs text-left animate-in fade-in duration-200">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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
              <label htmlFor="senha" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Senha
              </label>
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
        </div>
      </div>
    </div>
  );
}
