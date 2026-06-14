'use server';

import { createClient } from '@supabase/supabase-js';

// Inicializar cliente do Supabase no lado do servidor
function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, anonKey);
}

/**
 * Realiza o login do administrador no lado do servidor para evitar bloqueios de rede no navegador.
 */
export async function loginAdminServer(email: string, password: string) {
  const supabase = getSupabaseServer();

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    // Verificar se o usuário possui cargo 'admin' na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.warn('Aviso: Perfil não encontrado no banco de dados durante o login do servidor.');
    }

    // Se o perfil existe mas não é admin, deslogar e bloquear
    if (profile && profile.role !== 'admin') {
      await supabase.auth.signOut();
      return { success: false, error: 'Acesso negado. Este usuário não é um administrador.' };
    }

    // Retorna a sessão para o cliente setar no localStorage/cookies do navegador
    return { 
      success: true, 
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user: data.user
      } 
    };
  } catch (err: any) {
    console.error('Erro de servidor no login:', err);
    return { success: false, error: err.message || 'Erro inesperado no servidor.' };
  }
}

/**
 * Envia o e-mail de recuperação de senha pelo lado do servidor.
 */
export async function resetPasswordServer(email: string, origin: string) {
  const supabase = getSupabaseServer();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/login`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro de servidor na redefinição de senha:', err);
    return { success: false, error: err.message || 'Erro inesperado no servidor.' };
  }
}
