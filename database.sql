-- ==========================================
-- SCRIPT DE BANCO DE DADOS - PORTAL BIGBUS
-- ==========================================

-- 1. Tabela de Perfis (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'cliente')) DEFAULT 'cliente' NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Tabela de Veículos (Veiculos)
CREATE TABLE IF NOT EXISTS public.veiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC(12, 2) NOT NULL,
    tipo TEXT CHECK (tipo IN ('van', 'onibus', 'carro', 'motor')) NOT NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano_fabricacao INTEGER NOT NULL,
    ano_modelo INTEGER NOT NULL,
    quilometragem INTEGER NOT NULL,
    combustivel TEXT NOT NULL,
    status TEXT CHECK (status IN ('disponivel', 'vendido')) DEFAULT 'disponivel' NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    anunciado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Habilitar RLS em veiculos
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

-- 3. Tabela de Fotos do Veículo (Fotos_Veiculo)
CREATE TABLE IF NOT EXISTS public.fotos_veiculo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE CASCADE NOT NULL,
    url_foto TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em fotos_veiculo
ALTER TABLE public.fotos_veiculo ENABLE ROW LEVEL SECURITY;

-- 4. Tabela de Propostas (Propostas)
CREATE TABLE IF NOT EXISTS public.propostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE CASCADE NOT NULL,
    nome_cliente TEXT NOT NULL,
    telefone_cliente TEXT NOT NULL,
    tipo_proposta TEXT CHECK (tipo_proposta IN ('compra', 'troca', 'financiamento')) NOT NULL,
    mensagem TEXT,
    criada_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em propostas
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Políticas para 'profiles'
CREATE POLICY "Qualquer um pode ver perfis públicos" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para 'veiculos'
CREATE POLICY "Qualquer um pode ver veículos disponíveis ou vendidos" ON public.veiculos
    FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem inserir veículos" ON public.veiculos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Apenas administradores podem atualizar veículos" ON public.veiculos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Apenas administradores podem deletar veículos" ON public.veiculos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para 'fotos_veiculo'
CREATE POLICY "Qualquer um pode ver fotos dos veículos" ON public.fotos_veiculo
    FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem inserir fotos" ON public.fotos_veiculo
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Apenas administradores podem deletar fotos" ON public.fotos_veiculo
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para 'propostas'
CREATE POLICY "Apenas administradores podem selecionar propostas" ON public.propostas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Qualquer um pode criar propostas" ON public.propostas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Apenas administradores podem deletar propostas" ON public.propostas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ==========================================
-- TRIGGERS E FUNÇÕES DE AUTOMAÇÃO
-- ==========================================

-- Função para registrar automaticamente perfil ao criar conta no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role, telefone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', 'Administrador BigBus'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'cliente'),
    new.raw_user_meta_data->>'telefone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger ao criar usuário auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- BUCKETS DE STORAGE (SUPABASE STORAGE)
-- ==========================================
-- Nota: Os buckets do Supabase Storage geralmente são criados via painel ou via RPC.
-- Para criar o bucket 'veiculos' e permitir acesso público a leitura e acesso admin para escrita:
--
-- Para criar o bucket, o Supabase possui a tabela storage.buckets.
-- O script abaixo insere o bucket 'veiculos' se não existir.
INSERT INTO storage.buckets (id, name, public)
VALUES ('veiculos', 'veiculos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para o bucket 'veiculos'
CREATE POLICY "Acesso público para fotos dos veículos"
ON storage.objects FOR SELECT
USING (bucket_id = 'veiculos');

CREATE POLICY "Administradores podem gerenciar fotos dos veículos"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'veiculos' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
