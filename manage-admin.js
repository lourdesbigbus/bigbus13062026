const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Carregar variáveis de ambiente manualmente
let env = {};
try {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      env[key] = val;
    }
  });
} catch (e) {
  console.warn("Aviso ao carregar .env.local:", e.message);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos em .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];

  if (action === 'reset-password') {
    const email = args[1] || 'lourdes.bigbus@gmail.com';
    const newPassword = args[2] || 'BigBusAdmin2026!';
    
    console.log(`Buscando usuário pelo e-mail: ${email}...`);
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("Erro ao listar usuários:", listError.message);
      return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      console.error(`Usuário com o e-mail ${email} não encontrado.`);
      return;
    }

    console.log(`Usuário encontrado (ID: ${user.id}). Redefinindo senha...`);
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateError) {
      console.error("Erro ao redefinir senha:", updateError.message);
    } else {
      console.log(`\n✅ Senha para o usuário ${email} foi redefinida com sucesso!`);
      console.log(`Nova Senha: ${newPassword}`);
    }

  } else if (action === 'create-admin') {
    const email = args[1];
    const password = args[2];
    const nome = args[3] || 'Administrador';

    if (!email || !password) {
      console.log("Uso: node manage-admin.js create-admin <email> <senha> [nome]");
      return;
    }

    console.log(`Criando novo usuário administrador no Auth: ${email}...`);
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome, role: 'admin' }
    });

    if (createError) {
      console.error("Erro ao criar usuário no Auth:", createError.message);
      return;
    }

    console.log(`Usuário criado com ID: ${user.id}. Vinculando role 'admin' no perfil (profiles)...`);
    
    // Atualizar perfil na tabela profiles (caso o trigger não tenha setado como 'admin')
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin', nome })
      .eq('id', user.id);

    if (profileError) {
      console.error("Erro ao atualizar perfil na tabela profiles:", profileError.message);
      console.log("Tentando inserir o perfil manualmente...");
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.id, nome, email, role: 'admin' });

      if (insertError) {
        console.error("Erro ao inserir perfil manualmente:", insertError.message);
        return;
      }
    }

    console.log(`\n✅ Usuário administrador criado e ativado com sucesso!`);
    console.log(`E-mail: ${email}`);
    console.log(`Senha: ${password}`);

  } else {
    console.log("Ações disponíveis:");
    console.log("  node manage-admin.js reset-password [<email>] [<nova_senha>]");
    console.log("  node manage-admin.js create-admin <email> <senha> [<nome>]");
  }
}

main();
