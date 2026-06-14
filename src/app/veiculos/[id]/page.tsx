import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Veiculo } from '@/types';
import GalleryCarousel from '@/components/GalleryCarousel';
import ProposalForm from '@/components/ProposalForm';
import { ChevronLeft, Calendar, Gauge, Fuel, Info, CircleDot } from 'lucide-react';

// Reutilizar o mesmo mock do page.tsx para fallback
const MOCK_VEICULOS: Veiculo[] = [
  {
    id: 'mock-1',
    titulo: 'Mercedes-Benz Sprinter 415 CDI Executiva Escolar 16L',
    descricao: 'Van Sprinter executiva completa, ar condicionado central, tacógrafo em dia, ideal para fretamento ou escolar. Veículo periciado, com todas as revisões periódicas feitas em concessionária autorizada. Pneus em excelente estado e tapeçaria original impecável.',
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
    descricao: 'Ônibus rodoviário de turismo, 46 lugares com sanitário, ar condicionado central, conservado e revisado. Mecânica operacional Scania K360 em perfeito estado de funcionamento, cabine leito para motorista, geladeira e monitores de TV integrados.',
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
    descricao: 'Hilux SRV extremamente nova, único dono, revisões em concessionária, capota marítima e pneus novos. Rodas de liga leve aro 18, faróis em LED, multimídia integrada com câmera de ré, tração 4x4 ativa, bancos em couro com regulagem elétrica.',
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
    descricao: 'Motor Cummins ISC completo de alta durabilidade, bloco retificado na garantia, ideal para caminhões e ônibus. Acompanha bomba injetora e bicos recalibrados. Aprovado nos testes de bancada dinamométrica com excelente taxa de compressão.',
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

interface DetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VehicleDetailPage({ params }: DetailPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let veiculo: Veiculo | null = null;

  // Tentar buscar do Supabase
  try {
    const { data, error } = await supabase
      .from('veiculos')
      .select('*, fotos:fotos_veiculo(*), anunciante:profiles(*)')
      .eq('id', id)
      .single();

    if (!error && data) {
      veiculo = data;
    }
  } catch (err) {
    console.warn('Erro ao buscar veículo do Supabase. Procurando em mock local:', err);
  }

  // Fallback para mock
  if (!veiculo) {
    veiculo = MOCK_VEICULOS.find((v) => v.id === id) || null;
  }

  if (!veiculo) {
    notFound();
  }

  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(veiculo.preco);

  const kmFormatada = new Intl.NumberFormat('pt-BR').format(veiculo.quilometragem);

  const tagsTipoMap = {
    van: 'Van Comercial',
    onibus: 'Ônibus',
    carro: 'Carro',
    motor: 'Motor Pesado',
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Botão de Voltar */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Voltar para o Estoque</span>
        </Link>
      </div>

      {/* Título Principal */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-primary/10 text-primary border border-primary/20 dark:bg-primary-light/50 dark:text-white px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
            {tagsTipoMap[veiculo.tipo] || veiculo.tipo}
          </span>
          {veiculo.status === 'vendido' && (
            <span className="bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
              Vendido
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          {veiculo.titulo}
        </h1>
        <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
          {veiculo.marca} • {veiculo.modelo}
        </p>
      </div>

      {/* Grid Principal (Imagem e Conteúdo vs Form de Proposta) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Imagem, Ficha Técnica, Descrição */}
        <div className="lg:col-span-8 space-y-8">
          {/* Carrossel */}
          <GalleryCarousel fotos={veiculo.fotos} titulo={veiculo.titulo} />

          {/* Ficha Técnica */}
          <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border space-y-4 shadow-sm">
            <h3 className="text-lg font-extrabold tracking-tight flex items-center space-x-2 border-b border-border pb-3">
              <Info className="h-5 w-5 text-accent" />
              <span>Ficha Técnica Completa</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-background p-4 rounded-xl border border-border flex flex-col justify-between space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Ano Modelo</span>
                <div className="flex items-center space-x-1.5 font-bold text-foreground">
                  <Calendar className="h-4 w-4 text-accent shrink-0" />
                  <span>{veiculo.ano_modelo}</span>
                </div>
              </div>

              <div className="bg-background p-4 rounded-xl border border-border flex flex-col justify-between space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Ano Fabricação</span>
                <div className="flex items-center space-x-1.5 font-bold text-foreground">
                  <Calendar className="h-4 w-4 text-accent shrink-0" />
                  <span>{veiculo.ano_fabricacao}</span>
                </div>
              </div>

              <div className="bg-background p-4 rounded-xl border border-border flex flex-col justify-between space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Quilometragem</span>
                <div className="flex items-center space-x-1.5 font-bold text-foreground">
                  <Gauge className="h-4 w-4 text-accent shrink-0" />
                  <span className="truncate">{kmFormatada} km</span>
                </div>
              </div>

              <div className="bg-background p-4 rounded-xl border border-border flex flex-col justify-between space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Combustível</span>
                <div className="flex items-center space-x-1.5 font-bold text-foreground">
                  <Fuel className="h-4 w-4 text-accent shrink-0" />
                  <span className="truncate">{veiculo.combustivel}</span>
                </div>
              </div>
            </div>

            {/* Outras especificações detalhadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-slate-400 font-medium">Marca</span>
                <span className="font-bold text-foreground">{veiculo.marca}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-slate-400 font-medium">Modelo</span>
                <span className="font-bold text-foreground">{veiculo.modelo}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-slate-400 font-medium">Tipo de Transmissão</span>
                <span className="font-bold text-foreground">Manual / Automatizado</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-slate-400 font-medium">Garantia</span>
                <span className="font-bold text-foreground">Procedência BigBus</span>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold tracking-tight text-foreground flex items-center space-x-2">
              <CircleDot className="h-5 w-5 text-accent" />
              <span>Descrição do Veículo</span>
            </h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-base">
              {veiculo.descricao || 'Nenhuma descrição fornecida pelo anunciante.'}
            </p>
          </div>
        </div>

        {/* Lado Direito: Preço e Formulário de Contato */}
        <div className="lg:col-span-4 space-y-6">
          {/* Box de Preço */}
          <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex flex-col space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Valor Especial</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {precoFormatado}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              * Sujeito a alteração. Aceitamos veículos comerciais e pesados como parte do pagamento.
            </span>
          </div>

          {/* Form de Proposta */}
          <ProposalForm veiculoId={veiculo.id} veiculoTitulo={veiculo.titulo} />
        </div>
      </div>
    </div>
  );
}
