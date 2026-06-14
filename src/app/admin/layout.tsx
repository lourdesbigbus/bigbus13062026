'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Users, Truck, LogOut, Loader2, Menu, X, ArrowLeft } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Estados de controle
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Obter a sessão ativa
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // 2. Obter perfil do banco para checar o role de admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('nome, role')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          // Fallback se perfil não foi criado via trigger (ex: criados direto no painel)
          console.warn('Perfil não encontrado no banco. Autenticação prossegue.');
          setUserName(session.user.email || 'Admin');
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Validar role admin
        if (profile.role !== 'admin') {
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }

        setUserName(profile.nome || session.user.email || 'Admin');
        setAuthorized(true);
      } catch (err) {
        console.error('Erro ao verificar permissão:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Logout do administrador
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { name: 'Estoque', href: '/admin', icon: LayoutDashboard },
    { name: 'Leads / Propostas', href: '/admin/leads', icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
        <span className="text-sm font-semibold text-gray-300">Carregando painel administrativo...</span>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* 1. Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white border-r border-primary-light shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-primary-light flex items-center space-x-3">
          <div className="bg-accent p-2 rounded-lg text-primary">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg uppercase tracking-tight block">
              Big<span className="text-accent">Bus</span>
            </span>
            <span className="text-[9px] tracking-widest text-slate-400 block -mt-1 font-bold">
              Painel Admin
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 bg-primary-light/30 border-b border-primary-light text-xs flex flex-col">
          <span className="text-slate-400">Olá, bem-vindo</span>
          <span className="font-bold text-white mt-0.5 truncate">{userName}</span>
        </div>

        {/* Menu */}
        <nav className="flex-grow p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-accent text-primary'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions Bottom */}
        <div className="p-4 border-t border-primary-light space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Portal</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* 2. Header Mobile */}
      <header className="md:hidden bg-primary text-white p-4 flex items-center justify-between border-b border-primary-light shrink-0">
        <Link href="/admin" className="flex items-center space-x-2">
          <Truck className="h-5 w-5 text-accent" />
          <span className="font-extrabold uppercase text-base tracking-tight">
            Big<span className="text-accent">Bus</span> Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded bg-primary-light text-gray-300"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          {/* Drawer Content */}
          <div className="relative flex flex-col w-64 max-w-xs bg-primary text-white h-full z-50 animate-in slide-in-from-left duration-200">
            <div className="p-6 border-b border-primary-light flex items-center justify-between">
              <span className="font-extrabold text-lg uppercase">BigBus Admin</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-400">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-grow p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active ? 'bg-accent text-primary' : 'text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-primary-light space-y-2">
              <Link
                href="/"
                className="flex items-center space-x-2 text-xs text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar ao Portal</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 text-xs text-red-400 py-2 text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair do Painel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <main className="flex-grow p-6 sm:p-10 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
