'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Proposta } from '@/types';
import { MessageSquare, Calendar, Phone, Trash2, ArrowUpRight, Search, Mail, Loader2, Users } from 'lucide-react';

// Mocks de leads em caso de banco offline/vazio
const MOCK_LEADS: Proposta[] = [
  {
    id: 'lead-1',
    veiculo_id: 'mock-1',
    nome_cliente: 'Roberto Alencar',
    telefone_cliente: '(11) 98888-7777',
    tipo_proposta: 'compra',
    mensagem: 'Tenho interesse em comprar à vista a Sprinter 415 CDI Executiva. Qual a menor taxa de transferência?',
    criada_em: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
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
    criada_em: new Date(Date.now() - 7200000 * 2).toISOString(), // 4 horas atrás
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
  }
];

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('propostas')
        .select('*, veiculo:veiculos(*)')
        .order('criada_em', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setLeads(MOCK_LEADS);
      } else {
        setLeads(data as unknown as Proposta[]);
      }
    } catch (err) {
      console.warn('Erro ao carregar leads do Supabase. Utilizando mock de propostas local.', err);
      setLeads(MOCK_LEADS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Excluir proposta (lead)
  const handleDeleteLead = async (id: string) => {
    if (!confirm('Deseja realmente arquivar/deletar esta proposta de lead?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('propostas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      alert('Lead removido com sucesso!');
    } catch (err: any) {
      console.error('Erro ao deletar lead:', err);
      if (id.startsWith('lead-')) {
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
        alert('Lead de demonstração removido localmente.');
      } else {
        alert('Falha ao excluir lead: ' + err.message);
      }
    }
  };

  // Gerar link de WhatsApp
  const getWhatsAppLink = (telefone: string, nome: string, tituloVeiculo: string) => {
    // Limpar caracteres não numéricos do telefone
    const numeroLimpo = telefone.replace(/\D/g, '');
    // Se não tiver código do país, assume Brasil (55)
    const ddi = numeroLimpo.length <= 11 ? '55' : '';
    const mensagem = encodeURIComponent(
      `Olá ${nome}! Aqui é da BigBus Veículos Pesados. Recebemos seu interesse em nosso veículo *${tituloVeiculo}* anunciado no portal. Como posso te ajudar hoje?`
    );
    return `https://wa.me/${ddi}${numeroLimpo}?text=${mensagem}`;
  };

  // Filtrar leads
  const filteredLeads = leads.filter((lead) =>
    lead.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.telefone_cliente.includes(searchTerm) ||
    lead.veiculo?.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tagsTipoProposta = {
    compra: { label: 'Compra à Vista', css: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    troca: { label: 'Quero Trocar', css: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    financiamento: { label: 'Simular Financiamento', css: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Leads e Propostas</h1>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhe os contatos de clientes interessados no estoque e inicie negociações diretamente no WhatsApp.
        </p>
      </div>

      {/* Caixa de Busca */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute left-3.5 top-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Filtrar por nome de cliente, telefone ou veículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border pl-10 pr-4 py-2.5 rounded-lg text-sm"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          {filteredLeads.length} leads recebidos
        </span>
      </div>

      {/* Grid de Leads */}
      {loading ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border space-y-4">
          <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto" />
          <span className="text-sm text-slate-500 font-semibold">Carregando propostas...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border space-y-3">
          <Users className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-slate-500 font-medium">Nenhum contato ou lead pendente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLeads.map((lead) => {
            const dataEnvio = new Date(lead.criada_em).toLocaleString('pt-BR');
            const veiculoTitulo = lead.veiculo?.titulo || 'Veículo Não Identificado';
            
            return (
              <div
                key={lead.id}
                className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Top: Header e Data */}
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      tagsTipoProposta[lead.tipo_proposta]?.css || 'bg-slate-100 text-slate-600'
                    }`}>
                      {tagsTipoProposta[lead.tipo_proposta]?.label || lead.tipo_proposta}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{dataEnvio}</span>
                    </span>
                  </div>

                  {/* Informações Cliente */}
                  <div>
                    <h3 className="font-extrabold text-lg text-foreground truncate">{lead.nome_cliente}</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                      <Phone className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className="font-semibold">{lead.telefone_cliente}</span>
                    </p>
                  </div>

                  {/* Veículo de Interesse */}
                  <div className="p-3 bg-slate-500/5 rounded-xl border border-border/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Veículo de Interesse</span>
                    {lead.veiculo ? (
                      <a
                        href={`/veiculos/${lead.veiculo.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-xs text-primary-light dark:text-gray-300 hover:text-accent flex items-center space-x-1 mt-1 truncate"
                      >
                        <span className="truncate">{veiculoTitulo}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="font-bold text-xs text-slate-400 block mt-1">
                        {veiculoTitulo}
                      </span>
                    )}
                  </div>

                  {/* Mensagem do Cliente */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Mensagem</span>
                    <p className="text-sm text-slate-600 leading-relaxed italic bg-background p-3 rounded-xl border border-border/40">
                      &ldquo;{lead.mensagem || 'Nenhuma observação enviada.'}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Ações (Responder via Whats, Excluir) */}
                <div className="flex gap-2 pt-2 border-t border-border/80">
                  <a
                    href={getWhatsAppLink(lead.telefone_cliente, lead.nome_cliente, veiculoTitulo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs shadow transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Iniciar no WhatsApp</span>
                  </a>
                  <button
                    onClick={() => handleDeleteLead(lead.id)}
                    className="p-2.5 bg-slate-500/5 hover:bg-red-600 hover:text-white rounded-lg text-slate-400 transition-colors"
                    title="Excluir Lead"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
