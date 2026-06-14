'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Proposta } from '@/types';
import { 
  MessageSquare, 
  Calendar, 
  Phone, 
  Trash2, 
  ArrowUpRight, 
  Search, 
  Loader2, 
  Users, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Save, 
  Clock, 
  ArrowRight, 
  Eye, 
  FileText,
  AlertTriangle,
  Info,
  DollarSign,
  TrendingUp
} from 'lucide-react';

// Mocks de leads em caso de banco offline/vazio
const MOCK_LEADS: Proposta[] = [
  {
    id: 'lead-1',
    veiculo_id: 'mock-1',
    nome_cliente: 'Roberto Alencar',
    telefone_cliente: '(11) 98888-7777',
    tipo_proposta: 'compra',
    mensagem: 'Tenho interesse em comprar à vista a Sprinter 415 CDI Executiva. Qual a menor taxa de transferência?',
    criada_em: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 horas atrás
    status: 'novo',
    observacoes: 'Cliente demonstrou urgência. Retornar sobre taxas de transferência.',
    veiculo: {
      id: 'mock-1',
      titulo: 'Mercedes-Benz Sprinter 415 CDI Executiva Escolar 16L',
      descricao: null,
      preco: 169900,
      tipo: 'van',
      marca: 'Mercedes-Benz',
      modelo: 'Sprinter',
      ano_fabricacao: 2018,
      ano_modelo: 2019,
      quilometragem: 142000,
      combustivel: 'Diesel',
      status: 'disponivel',
      criado_em: '',
      anunciado_por: null
    }
  },
  {
    id: 'lead-2',
    veiculo_id: 'mock-2',
    nome_cliente: 'Auto Transportes Progresso',
    telefone_cliente: '(31) 97777-6666',
    tipo_proposta: 'financiamento',
    mensagem: 'Gostaria de simular um financiamento com entrada de 30% e saldo em 48x para o ônibus Paradiso G7.',
    criada_em: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 horas atrás
    status: 'em_atendimento',
    observacoes: 'Ligado para o financeiro. Aguardando retorno da simulação no banco Safra.',
    veiculo: {
      id: 'mock-2',
      titulo: 'Marcopolo Paradiso G7 1200 Rodoviário Scania K360',
      descricao: null,
      preco: 420000,
      tipo: 'onibus',
      marca: 'Marcopolo',
      modelo: 'Paradiso G7 1200',
      ano_fabricacao: 2017,
      ano_modelo: 2017,
      quilometragem: 320000,
      combustivel: 'Diesel',
      status: 'disponivel',
      criado_em: '',
      anunciado_por: null
    }
  },
  {
    id: 'lead-3',
    veiculo_id: 'mock-1',
    nome_cliente: 'Cláudio Pereira da Silva',
    telefone_cliente: '(21) 96543-2109',
    tipo_proposta: 'troca',
    mensagem: 'Aceita uma Van Sprinter 2015 como parte de pagamento da Sprinter 2018?',
    criada_em: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 dia atrás
    status: 'negociacao',
    observacoes: 'Aguardando envio das fotos da van dele para avaliação do mecânico.',
    veiculo: {
      id: 'mock-1',
      titulo: 'Mercedes-Benz Sprinter 415 CDI Executiva Escolar 16L',
      descricao: null,
      preco: 169900,
      tipo: 'van',
      marca: 'Mercedes-Benz',
      modelo: 'Sprinter',
      ano_fabricacao: 2018,
      ano_modelo: 2019,
      quilometragem: 142000,
      combustivel: 'Diesel',
      status: 'disponivel',
      criado_em: '',
      anunciado_por: null
    }
  }
];

// Configuração das etapas do CRM
const STAGES = [
  { id: 'novo', name: 'Novos', color: 'border-t-blue-500 bg-blue-500/5 text-blue-500 dark:text-blue-400', labelBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'em_atendimento', name: 'Em Atendimento', color: 'border-t-amber-500 bg-amber-500/5 text-amber-500 dark:text-amber-400', labelBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'negociacao', name: 'Negociação', color: 'border-t-purple-500 bg-purple-500/5 text-purple-500 dark:text-purple-400', labelBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'ganho', name: 'Ganho (Vendido)', color: 'border-t-emerald-500 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400', labelBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'perdido', name: 'Perdido', color: 'border-t-rose-500 bg-rose-500/5 text-rose-500 dark:text-rose-400', labelBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
];

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Estados de Controle do Modal de Detalhes
  const [selectedLead, setSelectedLead] = useState<Proposta | null>(null);
  const [localObsText, setLocalObsText] = useState('');
  const [savingObs, setSavingObs] = useState(false);

  // Fallback se o banco não tiver as colunas status e observacoes
  const [fallbackAlert, setFallbackAlert] = useState(false);

  // Configuração do WhatsApp de Contato
  const [configWhatsapp, setConfigWhatsapp] = useState('5511999999999');
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('propostas')
        .select('*, veiculo:veiculos(*)');

      if (error) throw error;

      if (!data || data.length === 0) {
        setLeads(MOCK_LEADS);
      } else {
        // Garantir valores padrão para status e observações
        const parsedLeads = data.map((item: any) => ({
          ...item,
          status: item.status || 'novo',
          observacoes: item.observacoes || '',
        })) as Proposta[];
        
        // Ordenar por data decrescente
        parsedLeads.sort((a, b) => new Date(b.criada_em).getTime() - new Date(a.criada_em).getTime());
        setLeads(parsedLeads);
      }
    } catch (err: any) {
      console.warn('Aviso ao carregar leads do banco. Usando dados locais.', err);
      // Se houver erro de falta de colunas (caso o banco já tenha propostas mas não rodou a migração)
      if (err.message && (err.message.includes('column') || err.message.includes('status'))) {
        setFallbackAlert(true);
      }
      setLeads(MOCK_LEADS);
    } finally {
      setLoading(false);
    }
  };

  const fetchWhatsappConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'whatsapp_contato')
        .single();
      if (!error && data?.valor) {
        setConfigWhatsapp(data.valor);
      }
    } catch (e) {
      // Ignorar silenciosamente se a tabela configuracoes não existir
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchWhatsappConfig();
  }, []);

  const handleSaveWhatsappConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    const cleanedNumber = configWhatsapp.replace(/\D/g, '');

    try {
      const { error } = await supabase
        .from('configuracoes')
        .upsert({ chave: 'whatsapp_contato', valor: cleanedNumber });

      if (error) throw error;
      alert('Número de WhatsApp de atendimento atualizado com sucesso no site!');
      setShowConfigPanel(false);
    } catch (err: any) {
      console.error('Erro ao salvar WhatsApp:', err);
      if (err.message && (err.message.includes('relation') || err.message.includes('configuracoes'))) {
        alert('Tabela "configuracoes" não encontrada. Execute o script SQL no painel do Supabase para criar a tabela e salvar permanentemente.');
      } else {
        alert('Erro ao salvar número de WhatsApp: ' + err.message);
      }
    } finally {
      setSavingConfig(false);
    }
  };

  // Atualizar Status do Lead (Pipeline)
  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    // Atualização local imediata
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    );

    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    if (leadId.startsWith('lead-')) {
      // É mockado
      return;
    }

    try {
      const { error } = await supabase
        .from('propostas')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Erro ao atualizar status no Supabase:', err);
      if (err.message && (err.message.includes('column') || err.message.includes('status'))) {
        setFallbackAlert(true);
      } else {
        alert('Erro ao persistir status: ' + err.message);
      }
    }
  };

  // Salvar observações do lead
  const saveObservations = async () => {
    if (!selectedLead) return;
    setSavingObs(true);

    const leadId = selectedLead.id;
    const text = localObsText;

    // Atualização local imediata
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, observacoes: text } : lead))
    );
    setSelectedLead((prev) => (prev ? { ...prev, observacoes: text } : null));

    if (leadId.startsWith('lead-')) {
      setSavingObs(false);
      alert('Anotação de demonstração salva localmente!');
      return;
    }

    try {
      const { error } = await supabase
        .from('propostas')
        .update({ observacoes: text })
        .eq('id', leadId);

      if (error) throw error;
      alert('Observações salvas com sucesso!');
    } catch (err: any) {
      console.error('Erro ao salvar observações no Supabase:', err);
      if (err.message && (err.message.includes('column') || err.message.includes('observacoes'))) {
        setFallbackAlert(true);
        alert('Salvo apenas em memória! Execute o script SQL no Supabase para salvar permanentemente.');
      } else {
        alert('Erro ao salvar no banco: ' + err.message);
      }
    } finally {
      setSavingObs(false);
    }
  };

  // Excluir proposta (lead)
  const handleDeleteLead = async (id: string) => {
    if (!confirm('Deseja realmente arquivar/excluir este lead permanentemente?')) {
      return;
    }

    // Fechar modal se estiver aberto
    if (selectedLead?.id === id) {
      setSelectedLead(null);
    }

    try {
      if (!id.startsWith('lead-')) {
        const { error } = await supabase.from('propostas').delete().eq('id', id);
        if (error) throw error;
      }
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      alert('Lead excluído do CRM!');
    } catch (err: any) {
      console.error('Erro ao deletar lead:', err);
      alert('Falha ao excluir lead: ' + err.message);
    }
  };

  // Abrir Modal de Detalhes do Lead
  const openLeadDetails = (lead: Proposta) => {
    setSelectedLead(lead);
    setLocalObsText(lead.observacoes || '');
  };

  // Drag and Drop (Kanban)
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      await updateLeadStatus(leadId, targetStatus);
    }
  };

  // Gerar link de WhatsApp dinâmico por status
  const getWhatsAppLink = (telefone: string, nome: string, status: string, tituloVeiculo: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    const ddi = numeroLimpo.length <= 11 ? '55' : '';
    
    let mensagemText = '';
    if (status === 'negociacao') {
      mensagemText = `Olá ${nome}! Aqui é da BigBus Veículos Pesados. Estou dando andamento à sua proposta de negociação do veículo *${tituloVeiculo}*. Você conseguiu analisar as condições que conversamos?`;
    } else if (status === 'em_atendimento') {
      mensagemText = `Olá ${nome}! Aqui é da BigBus Veículos Pesados. Vi seu interesse no veículo *${tituloVeiculo}* anunciado no portal. Qual seria o melhor horário para conversarmos e simularmos valores?`;
    } else {
      mensagemText = `Olá ${nome}! Aqui é da BigBus Veículos Pesados. Recebi seu interesse no veículo *${tituloVeiculo}* anunciado no portal. Como posso te ajudar hoje?`;
    }

    return `https://wa.me/${ddi}${numeroLimpo}?text=${encodeURIComponent(mensagemText)}`;
  };

  // Filtrar leads por termo de busca
  const filteredLeads = leads.filter((lead) =>
    lead.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.telefone_cliente.includes(searchTerm) ||
    lead.veiculo?.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Contadores de estatísticas
  const totalCount = leads.length;
  const newCount = leads.filter((l) => l.status === 'novo').length;
  const inProgressCount = leads.filter((l) => l.status === 'em_atendimento').length;
  const negotiationCount = leads.filter((l) => l.status === 'negociacao').length;
  const wonCount = leads.filter((l) => l.status === 'ganho').length;
  const conversionRate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;

  const tagsTipoProposta = {
    compra: { label: 'Compra à Vista', css: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    troca: { label: 'Quero Trocar', css: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    financiamento: { label: 'Simular Financiamento', css: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* 1. Header do CRM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center space-x-2">
            <span>CRM e Funil de Vendas</span>
            <span className="bg-accent/10 text-accent text-xs px-2.5 py-1 rounded-full border border-accent/20 uppercase tracking-widest font-extrabold animate-pulse">
              Ativo
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle o andamento das propostas, registre observações de clientes e inicie negociações direto no WhatsApp.
          </p>
        </div>

        {/* Botões e Toggles */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`inline-flex items-center space-x-1.5 px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all border ${
              showConfigPanel
                ? 'bg-accent text-primary border-accent shadow-sm'
                : 'bg-card border-border hover:bg-slate-500/5 text-foreground'
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Configurar WhatsApp do Site</span>
          </button>

          <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center space-x-1.5 px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban (Funil)</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center space-x-1.5 px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Tabela (Lista)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Painel de Configuração do WhatsApp do Site */}
      {showConfigPanel && (
        <form onSubmit={handleSaveWhatsappConfig} className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground flex items-center space-x-1.5">
                <Phone className="h-4 w-4 text-accent" />
                <span>WhatsApp de Atendimento do Portal</span>
              </h3>
              <p className="text-xs text-slate-500">
                Altere o número de WhatsApp que os clientes usam para iniciar conversas pelo botão flutuante e pelo topo do site.
              </p>
            </div>
            <button type="button" onClick={() => setShowConfigPanel(false)} className="text-xs font-bold text-slate-400 hover:text-foreground">
              ✕ Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="whats-input" className="text-[10px] uppercase font-bold text-slate-400">
                Número do WhatsApp (Com DDI e DDD)
              </label>
              <input
                id="whats-input"
                type="text"
                placeholder="Ex: 5511999999999"
                value={configWhatsapp}
                onChange={(e) => setConfigWhatsapp(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm"
                required
              />
              <span className="text-[10px] text-slate-400 block font-medium">
                Insira apenas números incluindo o código do país (55 para Brasil) e o DDD. Ex: <code>5511999999999</code>.
              </span>
            </div>
            <button
              type="submit"
              disabled={savingConfig}
              className="bg-primary dark:bg-accent text-white dark:text-primary hover:opacity-90 disabled:opacity-50 font-bold px-5 py-3 rounded-lg text-xs shadow transition-all flex items-center justify-center space-x-1.5"
            >
              {savingConfig ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Novo Número</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 2. Banner de Alerta de Banco de Dados (Fallback) */}
      {fallbackAlert && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed animate-in fade-in duration-300">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold block">Aviso de Configuração (Modo Demonstração do CRM)</span>
            <p>
              As colunas de <strong>status</strong> e <strong>observações</strong> ainda não foram detectadas na tabela <code>propostas</code> do seu banco de dados Supabase. 
              O CRM está rodando localmente (em memória). Para ativar a persistência definitiva, copie e execute o script SQL abaixo no **SQL Editor** do seu painel do Supabase e faça o redeploy na Vercel:
            </p>
            <pre className="bg-slate-950/90 text-slate-300 p-3 rounded-lg text-[10px] font-mono select-all overflow-x-auto mt-2 max-w-full">
{`ALTER TABLE public.propostas 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('novo', 'em_atendimento', 'negociacao', 'ganho', 'perdido')) DEFAULT 'novo' NOT NULL;

ALTER TABLE public.propostas 
ADD COLUMN IF NOT EXISTS observacoes TEXT DEFAULT '';`}
            </pre>
          </div>
        </div>
      )}

      {/* 3. Dashboard de Métricas do CRM */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total de Leads</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-extrabold">{totalCount}</span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Contatos</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col justify-between border-l-4 border-l-blue-500">
          <span className="text-[10px] uppercase font-bold text-slate-400">Novos Recebidos</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-extrabold text-blue-500">{newCount}</span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Aguardando</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col justify-between border-l-4 border-l-amber-500">
          <span className="text-[10px] uppercase font-bold text-slate-400">Em Atendimento</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-extrabold text-amber-500">{inProgressCount}</span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Ligados</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col justify-between border-l-4 border-l-purple-500">
          <span className="text-[10px] uppercase font-bold text-slate-400">Negociações</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-extrabold text-purple-500">{negotiationCount}</span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Ativas</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <span className="text-[10px] uppercase font-bold text-slate-400">Taxa de Conversão</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-emerald-500">{conversionRate}%</span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-extrabold">
              {wonCount} Vendas
            </span>
          </div>
        </div>
      </div>

      {/* 4. Barra de Pesquisa */}
      <div className="flex bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute left-3.5 top-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Pesquisar por cliente, telefone ou veículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border pl-10 pr-4 py-2.5 rounded-lg text-sm placeholder-slate-400 focus:border-accent"
          />
        </div>
      </div>

      {/* 5. Renderização Principal (Kanban ou Lista) */}
      {loading ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-border space-y-4">
          <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto" />
          <span className="text-sm text-slate-500 font-semibold">Carregando CRM...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border space-y-3">
          <Users className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-slate-500 font-medium">Nenhum lead correspondente à busca.</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* VISUALIZAÇÃO KANBAN */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4 no-scrollbar">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`bg-slate-100 dark:bg-slate-900 rounded-2xl border-t-4 ${stage.color} border border-border shadow-sm flex flex-col min-h-[500px] shrink-0 w-full min-w-[240px] transition-colors p-3`}
              >
                {/* Header da Coluna */}
                <div className="flex items-center justify-between pb-3 border-b border-border mb-3 px-1">
                  <span className="font-extrabold text-sm uppercase tracking-wide text-foreground">
                    {stage.name}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards dos Leads */}
                <div className="space-y-3 flex-grow overflow-y-auto no-scrollbar">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-400 font-medium border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                      Arraste um lead aqui
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const dateText = new Date(lead.criada_em).toLocaleDateString('pt-BR');
                      const vehicleTitle = lead.veiculo?.titulo || 'Veículo Não Identificado';
                      
                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          className="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:border-slate-400 transition-all space-y-3 animate-in fade-in duration-200"
                        >
                          {/* Tipo de Proposta Badge */}
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest border ${
                              tagsTipoProposta[lead.tipo_proposta]?.css || 'bg-slate-200 text-slate-600'
                            }`}>
                              {tagsTipoProposta[lead.tipo_proposta]?.label || lead.tipo_proposta}
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold">{dateText}</span>
                          </div>

                          {/* Info Cliente */}
                          <div>
                            <h4 className="font-extrabold text-sm text-foreground truncate">{lead.nome_cliente}</h4>
                            <p className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5 font-bold">
                              <Phone className="h-3 w-3 text-accent shrink-0" />
                              <span>{lead.telefone_cliente}</span>
                            </p>
                          </div>

                          {/* Veículo */}
                          <div className="bg-slate-500/5 p-2 rounded-lg border border-border/40 text-[11px] truncate">
                            <span className="text-[8px] uppercase font-bold text-slate-400 block">Interesse</span>
                            <span className="font-bold text-slate-600 dark:text-slate-300 truncate block mt-0.5">{vehicleTitle}</span>
                          </div>

                          {/* Última Nota (se houver) */}
                          {lead.observacoes && (
                            <p className="text-[10px] text-slate-400 line-clamp-2 italic leading-relaxed border-l-2 border-l-accent pl-1.5">
                              {lead.observacoes}
                            </p>
                          )}

                          {/* Ações Rápidas */}
                          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-border/80">
                            <button
                              onClick={() => openLeadDetails(lead)}
                              className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-500 hover:text-accent uppercase tracking-wider transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                              <span>CRM</span>
                            </button>
                            <a
                              href={getWhatsAppLink(lead.telefone_cliente, lead.nome_cliente, lead.status || 'novo', vehicleTitle)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow transition-colors"
                              title="Conversar no WhatsApp"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISUALIZAÇÃO EM TABELA (LISTA) */
        <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-border text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-4 pl-6">Data</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Veículo de Interesse</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Estágio CRM</th>
                  <th className="p-4 text-center pr-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredLeads.map((lead) => {
                  const dataEnvio = new Date(lead.criada_em).toLocaleString('pt-BR');
                  const veiculoTitulo = lead.veiculo?.titulo || 'Veículo Não Identificado';
                  const stageObj = STAGES.find((s) => s.id === lead.status) || STAGES[0];
                  
                  return (
                    <tr key={lead.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-4 pl-6 text-xs text-slate-400 font-semibold">{dataEnvio}</td>
                      <td className="p-4">
                        <div className="font-bold text-foreground">{lead.nome_cliente}</div>
                        <div className="text-xs text-slate-400 font-medium">{lead.telefone_cliente}</div>
                      </td>
                      <td className="p-4 max-w-xs truncate">
                        <span className="font-bold text-foreground truncate block">{veiculoTitulo}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          tagsTipoProposta[lead.tipo_proposta]?.css || 'bg-slate-100 text-slate-600'
                        }`}>
                          {tagsTipoProposta[lead.tipo_proposta]?.label || lead.tipo_proposta}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="bg-background border border-border rounded px-2.5 py-1 text-xs font-bold"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => openLeadDetails(lead)}
                            className="p-2 bg-slate-500/5 hover:bg-accent hover:text-primary rounded-lg text-slate-400 hover:shadow transition-all"
                            title="Editar informações no CRM"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <a
                            href={getWhatsAppLink(lead.telefone_cliente, lead.nome_cliente, lead.status || 'novo', veiculoTitulo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-600 text-white rounded-lg hover:shadow transition-all"
                            title="WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-2 bg-slate-500/5 hover:bg-red-600 hover:text-white rounded-lg text-slate-400 hover:shadow transition-all"
                            title="Excluir Lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL CRM DETALHES E ANOTAÇÕES */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-border bg-slate-100 dark:bg-slate-900 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-accent flex items-center space-x-1.5">
                  <Sparkles className="h-3 w-3 animate-spin" />
                  <span>Gerenciamento CRM</span>
                </span>
                <h3 className="text-xl font-extrabold text-foreground mt-1 truncate">{selectedLead.nome_cliente}</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-foreground text-sm font-extrabold"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Informações Básicas do Lead */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-500/5 rounded-xl border border-border/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Telefone de Contato</span>
                  <p className="text-sm font-extrabold text-foreground flex items-center space-x-1.5">
                    <Phone className="h-4 w-4 text-accent" />
                    <span>{selectedLead.telefone_cliente}</span>
                  </p>
                </div>
                <div className="p-3 bg-slate-500/5 rounded-xl border border-border/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Data de Entrada</span>
                  <p className="text-sm font-extrabold text-foreground flex items-center space-x-1.5">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>{new Date(selectedLead.criada_em).toLocaleString('pt-BR')}</span>
                  </p>
                </div>
              </div>

              {/* Veículo de Interesse */}
              <div className="p-4 bg-slate-500/5 rounded-xl border border-border/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Veículo Solicitado</span>
                {selectedLead.veiculo ? (
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      <span className="font-extrabold text-sm text-foreground block">{selectedLead.veiculo.titulo}</span>
                      <span className="text-xs text-slate-400">
                        {selectedLead.veiculo.marca} • {selectedLead.veiculo.modelo} • {selectedLead.veiculo.ano_modelo} • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedLead.veiculo.preco)}
                      </span>
                    </div>
                    <a
                      href={`/veiculos/${selectedLead.veiculo.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-bold text-accent hover:underline shrink-0"
                    >
                      <span>Ver Anúncio</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="font-bold text-xs text-slate-400 block mt-1">
                    Veículo Não Encontrado
                  </span>
                )}
              </div>

              {/* Mensagem Enviada */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mensagem Original</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic bg-background p-4 rounded-xl border border-border/40">
                  &ldquo;{selectedLead.mensagem || 'Nenhuma mensagem ou observação enviada.'}&rdquo;
                </p>
              </div>

              {/* Seleção do Estágio (Pipeline) */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Fase do Pipeline CRM</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {STAGES.map((s) => {
                    const active = selectedLead.status === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => updateLeadStatus(selectedLead.id, s.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider p-2.5 rounded-lg border text-center transition-all ${
                          active
                            ? 'bg-accent text-primary border-accent shadow-sm scale-[1.02]'
                            : 'bg-background hover:bg-slate-500/5 border-border text-slate-500'
                        }`}
                      >
                        {s.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Observações / Anotações do CRM */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="observations" className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Observações do Vendedor (Anotações do Andamento)</span>
                  </label>
                  <span className="text-[9px] text-slate-400 font-semibold italic">Estas notas ficam ocultas para o cliente</span>
                </div>
                <textarea
                  id="observations"
                  rows={4}
                  placeholder="Escreva anotações como: 'Fiz a simulação e o cliente achou a parcela alta', 'Cliente agendou visita para sábado de manhã', 'Vendido à vista com desconto de R$2.000'..."
                  value={localObsText}
                  onChange={(e) => setLocalObsText(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm placeholder-slate-400"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-border bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => handleDeleteLead(selectedLead.id)}
                className="inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider py-2 sm:py-0 text-left sm:text-center"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir Lead</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={getWhatsAppLink(selectedLead.telefone_cliente, selectedLead.nome_cliente, selectedLead.status || 'novo', selectedLead.veiculo?.titulo || '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs shadow transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Iniciar no WhatsApp</span>
                </a>

                <button
                  type="button"
                  disabled={savingObs}
                  onClick={saveObservations}
                  className="inline-flex items-center justify-center space-x-2 bg-primary dark:bg-accent text-white dark:text-primary hover:opacity-90 disabled:opacity-50 font-bold px-5 py-3 rounded-xl text-xs shadow transition-all"
                >
                  {savingObs ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Salvar Anotações</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
