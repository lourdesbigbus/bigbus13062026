import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Veiculo } from '@/types';
import AdvancedFilter from '@/components/AdvancedFilter';
import VehicleCard from '@/components/VehicleCard';
import { ShieldCheck, Award, Users, Phone, Sparkles } from 'lucide-react';

// Dados mockados premium para fallback (Garante que o app funcione e compile sem erros mesmo sem o banco populado)
const MOCK_VEICULOS: Veiculo[] = [
  {
    id: 'mock-1',
    titulo: 'Mercedes-Benz Sprinter 415 CDI Executiva Escolar 16L',
    descricao: 'Van Sprinter executiva completa, ar condicionado central, tacógrafo em dia, ideal para fretamento ou escolar.',
    preco: 169900,
    tipo: 'van',
    marca: 'Mercedes-Benz',
    modelo: 'Sprinter 415 CDI',
    ano_fabricacao: 2018,
    ano_modelo: 2019,
    quilometragem: 142000,
    combustivel: 'Diesel',
    status: 'disponivel',
    criado_em: new Date().toISOString(),
    anunciado_por: null,
    fotos: [
      {
        id: 'f-1',
        veiculo_id: 'mock-1',
        url_foto: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
        criado_em: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'mock-2',
    titulo: 'Marcopolo Paradiso G7 1200 Rodoviário Scania K360',
    descricao: 'Ônibus rodoviário de turismo, 46 lugares com sanitário, ar condicionado central, conservado e revisado.',
    preco: 420000,
    tipo: 'onibus',
    marca: 'Marcopolo',
    modelo: 'Paradiso G7 1200',
    ano_fabricacao: 2017,
    ano_modelo: 2017,
    quilometragem: 320000,
    combustivel: 'Diesel',
    status: 'disponivel',
    criado_em: new Date().toISOString(),
    anunciado_por: null,
    fotos: [
      {
        id: 'f-2',
        veiculo_id: 'mock-2',
        url_foto: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800',
        criado_em: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'mock-3',
    titulo: 'Toyota Hilux CD SRV 2.8 4x4 Diesel Automática',
    descricao: 'Hilux SRV extremamente nova, único dono, revisões em concessionária, capota marítima e pneus novos.',
    preco: 215000,
    tipo: 'carro',
    marca: 'Toyota',
    modelo: 'Hilux CD SRV',
    ano_fabricacao: 2020,
    ano_modelo: 2020,
    quilometragem: 89000,
    combustivel: 'Diesel',
    status: 'disponivel',
    criado_em: new Date().toISOString(),
    anunciado_por: null,
    fotos: [
      {
        id: 'f-3',
        veiculo_id: 'mock-3',
        url_foto: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
        criado_em: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'mock-4',
    titulo: 'Motor Cummins ISC 315 HP Completo Retificado',
    descricao: 'Motor Cummins ISC completo de alta durabilidade, bloco retificado na garantia, ideal para caminhões e ônibus.',
    preco: 45000,
    tipo: 'motor',
    marca: 'Cummins',
    modelo: 'ISC 315 HP',
    ano_fabricacao: 2019,
    ano_modelo: 2019,
    quilometragem: 0,
    combustivel: 'Diesel',
    status: 'disponivel',
    criado_em: new Date().toISOString(),
    anunciado_por: null,
    fotos: [
      {
        id: 'f-4',
        veiculo_id: 'mock-4',
        url_foto: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800',
        criado_em: new Date().toISOString(),
      },
    ],
  },
];

interface PageProps {
  searchParams: Promise<{
    tipo?: string;
    marca?: string;
    anoMin?: string;
    anoMax?: string;
    precoMin?: string;
    precoMax?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  // Await do searchParams do Next.js 14/15
  const resolvedParams = await searchParams;
  const { tipo, marca, anoMin, anoMax, precoMin, precoMax } = resolvedParams;

  let veiculos: Veiculo[] = [];

  try {
    // Montagem da query do Supabase
    let query = supabase
      .from('veiculos')
      .select('*, fotos:fotos_veiculo(*)')
      .order('criado_em', { ascending: false });

    // Aplicar filtros se existirem
    if (tipo) query = query.eq('tipo', tipo);
    if (marca) query = query.ilike('marca', `%${marca}%`);
    if (anoMin) query = query.gte('ano_modelo', parseInt(anoMin));
    if (anoMax) query = query.lte('ano_modelo', parseInt(anoMax));
    if (precoMin) query = query.gte('preco', parseFloat(precoMin));
    if (precoMax) query = query.lte('preco', parseFloat(precoMax));

    const { data, error } = await query;

    if (error) throw error;
    veiculos = data || [];
  } catch (err) {
    console.warn('Erro ao buscar dados do Supabase. Utilizando mock de dados local:', err);
  }

  // Se o banco de dados estiver vazio, misturar ou utilizar o mock
  if (veiculos.length === 0) {
    veiculos = MOCK_VEICULOS.filter((v) => {
      if (tipo && v.tipo !== tipo) return false;
      if (marca && !v.marca.toLowerCase().includes(marca.toLowerCase())) return false;
      if (anoMin && v.ano_modelo < parseInt(anoMin)) return false;
      if (anoMax && v.ano_modelo > parseInt(anoMax)) return false;
      if (precoMin && v.preco < parseFloat(precoMin)) return false;
      if (precoMax && v.preco > parseFloat(precoMax)) return false;
      return true;
    });
  }

  return (
    <div className="w-full space-y-16 pb-20">
      {/* 1. Hero Section (Confiança e Tradição) */}
      <section className="relative overflow-hidden bg-primary text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 bg-radial-gradient-hero opacity-30 pointer-events-none" />
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Selo dos 25 anos */}
            <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/20 px-4 py-2 rounded-full text-accent font-semibold text-xs tracking-wider uppercase animate-pulse">
              <Sparkles className="h-4 w-4" />
              <span>Mais de 25 Anos de Tradição e Robustez</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white">
              Líder Nacional em <span className="text-accent">Veículos Pesados</span> e Comerciais
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Encontre a melhor seleção de Vans, Ônibus, Carros e Motores do Brasil. Facilitamos sua compra, troca e oferecemos simulações rápidas de financiamento.
            </p>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#catalogo"
                className="inline-flex items-center justify-center bg-accent text-primary font-bold hover:bg-accent-hover px-8 py-4 rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Ver Estoque Completo
              </a>
              <Link
                href="/#catalogo?tipo=onibus"
                className="inline-flex items-center justify-center bg-primary-light border border-slate-700 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-sm font-semibold transition-all"
              >
                Buscar Ônibus
              </Link>
            </div>
          </div>

          {/* Cards Rápidos de Credibilidade */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-primary-light/45 p-6 rounded-2xl border border-primary-light/40 backdrop-blur-sm space-y-3">
              <ShieldCheck className="h-8 w-8 text-accent" />
              <h3 className="font-extrabold text-white text-base">Compra Segura</h3>
              <p className="text-xs text-gray-400">Garantia total de procedência e documentação em dia para rodar sem preocupações.</p>
            </div>

            <div className="bg-primary-light/45 p-6 rounded-2xl border border-primary-light/40 backdrop-blur-sm space-y-3">
              <Award className="h-8 w-8 text-accent" />
              <h3 className="font-extrabold text-white text-base">Especialistas</h3>
              <p className="text-xs text-gray-400">Atendimento especializado no setor de transportes e pesados comerciais.</p>
            </div>

            <div className="bg-primary-light/45 p-6 rounded-2xl border border-primary-light/40 backdrop-blur-sm space-y-3 sm:col-span-2">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-accent" />
                <div>
                  <h3 className="font-extrabold text-white text-base">Financiamento Facilitado</h3>
                  <p className="text-xs text-gray-400">Parcerias com os maiores bancos de crédito pesado com taxas sob medida.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filtro de Busca */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <AdvancedFilter />
      </section>

      {/* 3. Catálogo de Destaques */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Estoque Destaque
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Descubra nossos veículos revisados com preços especiais.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Exibindo {veiculos.length} veículo(s)
          </span>
        </div>

        {veiculos.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border space-y-3">
            <p className="text-slate-500 font-medium">Nenhum veículo encontrado com os filtros selecionados.</p>
            <Link
              href="/"
              className="inline-flex text-xs font-bold text-accent hover:underline uppercase tracking-wider"
            >
              Limpar Filtros e Mostrar Todos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {veiculos.map((veiculo) => (
              <VehicleCard key={veiculo.id} veiculo={veiculo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
