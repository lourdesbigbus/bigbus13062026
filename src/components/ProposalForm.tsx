'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TipoProposta } from '@/types';
import { Send, CheckCircle2, AlertCircle, ShoppingCart, Repeat, Calculator, Loader2 } from 'lucide-react';

interface ProposalFormProps {
  veiculoId: string;
  veiculoTitulo: string;
}

export default function ProposalForm({ veiculoId, veiculoTitulo }: ProposalFormProps) {
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipoProposta, setTipoProposta] = useState<TipoProposta>('compra');

  // Estados de envio
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manipular envio de proposta
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mensagem padrão concatenada dependendo do tipo de proposta se o usuário não digitar nada
    let mensagemFinal = mensagem;
    if (!mensagemFinal.trim()) {
      if (tipoProposta === 'compra') {
        mensagemFinal = `Olá! Gostaria de receber mais detalhes sobre a compra do veículo ${veiculoTitulo}.`;
      } else if (tipoProposta === 'troca') {
        mensagemFinal = `Olá! Gostaria de avaliar meu veículo atual para troca pelo veículo ${veiculoTitulo}.`;
      } else if (tipoProposta === 'financiamento') {
        mensagemFinal = `Olá! Gostaria de realizar uma simulação de financiamento para o veículo ${veiculoTitulo}.`;
      }
    }

    try {
      const { error: insertError } = await supabase
        .from('propostas')
        .insert({
          veiculo_id: veiculoId,
          nome_cliente: nome,
          telefone_cliente: telefone,
          tipo_proposta: tipoProposta,
          mensagem: mensagemFinal,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setNome('');
      setTelefone('');
      setMensagem('');
    } catch (err: any) {
      console.error('Erro ao enviar proposta:', err);
      setError('Desculpe, ocorreu um erro ao enviar sua proposta. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'compra' as TipoProposta, label: 'Comprar', icon: ShoppingCart, description: 'Interesse de compra à vista ou financiado.' },
    { id: 'troca' as TipoProposta, label: 'Trocar', icon: Repeat, description: 'Diga o modelo do seu veículo usado na troca.' },
    { id: 'financiamento' as TipoProposta, label: 'Simular', icon: Calculator, description: 'Simule parcelas e taxas de entrada.' },
  ];

  return (
    <div className="bg-card text-card-foreground border border-border shadow-lg rounded-2xl overflow-hidden sticky top-24">
      {/* Header */}
      <div className="p-6 bg-primary text-white border-b border-primary-light/50">
        <h3 className="font-extrabold text-lg tracking-tight">Fale com a BigBus</h3>
        <p className="text-xs text-gray-400 mt-1">
          Nossa equipe entrará em contato em menos de 30 minutos.
        </p>
      </div>

      {success ? (
        <div className="p-8 text-center space-y-4 animate-in fade-in duration-300">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-full text-emerald-600 mb-2">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h4 className="text-lg font-bold text-foreground">Proposta Enviada!</h4>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            Obrigado pelo contato. Um de nossos especialistas em pesados ligará para você em breve.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg text-sm transition-colors mt-4"
          >
            Enviar Nova Proposta
          </button>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Seletor de Tipo de Proposta (Abas) */}
          <div className="grid grid-cols-3 gap-1 bg-background p-1.5 rounded-xl border border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tipoProposta === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTipoProposta(tab.id)}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                    active
                      ? 'bg-accent text-primary shadow'
                      : 'text-slate-500 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs font-medium text-slate-400 italic text-center">
            {tabs.find((t) => t.id === tipoProposta)?.description}
          </p>

          {/* Feedback de Erro */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl flex items-start space-x-2.5 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Completo */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="nome" className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Nome Completo
              </label>
              <input
                id="nome"
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Telefone / WhatsApp */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="telefone" className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Telefone (WhatsApp)
              </label>
              <input
                id="telefone"
                type="tel"
                required
                placeholder="Ex: (11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Mensagem / Detalhes */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="mensagem" className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Observação (Opcional)
              </label>
              <textarea
                id="mensagem"
                rows={3}
                placeholder={
                  tipoProposta === 'troca'
                    ? 'Ex: Tenho uma van Sprinter 2018 com 150.000km...'
                    : 'Escreva detalhes do financiamento ou suas dúvidas...'
                }
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center space-x-2 bg-accent text-primary font-bold hover:bg-accent-hover disabled:opacity-50 py-3.5 rounded-lg text-sm shadow transition-all duration-200 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enviando Proposta...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Enviar Minha Proposta</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
