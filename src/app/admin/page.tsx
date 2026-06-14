'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Veiculo, TipoVeiculo } from '@/types';
import VehicleForm from '@/components/VehicleForm';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

// Mocks locais em caso de banco offline/vazio
const INITIAL_MOCK_VEICULOS: Veiculo[] = [
  {
    id: 'mock-1',
    titulo: 'Mercedes-Benz Sprinter 415 CDI Executiva Escolar 16L',
    descricao: 'Van Sprinter executiva completa, ar condicionado central, tacógrafo em dia.',
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
    fotos: []
  },
  {
    id: 'mock-2',
    titulo: 'Marcopolo Paradiso G7 1200 Rodoviário Scania K360',
    descricao: 'Ônibus rodoviário de turismo, 46 lugares com sanitário.',
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
    fotos: []
  }
];

export default function AdminDashboard() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtro de busca textual local
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para exibição de formulário
  const [showForm, setShowForm] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);

  // Carregar dados de estoque
  const fetchStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('veiculos')
        .select('*, fotos:fotos_veiculo(*)')
        .order('criado_em', { ascending: false });

      if (dbError) throw dbError;
      
      // Se não houver dados, usamos os mockados como demonstração
      if (!data || data.length === 0) {
        setVeiculos(INITIAL_MOCK_VEICULOS);
      } else {
        setVeiculos(data);
      }
    } catch (err: any) {
      console.warn('Erro ao carregar estoque do Supabase. Carregando dados locais.', err);
      setVeiculos(INITIAL_MOCK_VEICULOS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Excluir veículo
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este veículo do catálogo? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Deletar no Supabase
      const { error: deleteError } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Atualizar estado local
      setVeiculos((prev) => prev.filter((v) => v.id !== id));
      alert('Veículo removido com sucesso!');
    } catch (err: any) {
      console.error('Erro ao deletar veículo:', err);
      // Se for mockado, permitimos deletar localmente
      if (id.startsWith('mock-')) {
        setVeiculos((prev) => prev.filter((v) => v.id !== id));
        alert('Veículo de demonstração removido localmente.');
      } else {
        alert('Falha ao excluir veículo: ' + err.message);
      }
    }
  };

  // Alternar status (Disponível vs Vendido)
  const toggleStatus = async (veiculo: Veiculo) => {
    const novoStatus = veiculo.status === 'disponivel' ? 'vendido' : 'disponivel';

    try {
      const { error: patchError } = await supabase
        .from('veiculos')
        .update({ status: novoStatus })
        .eq('id', veiculo.id);

      if (patchError) throw patchError;

      // Atualizar local
      setVeiculos((prev) =>
        prev.map((v) => (v.id === veiculo.id ? { ...v, status: novoStatus } : v))
      );
    } catch (err: any) {
      console.error('Erro ao alterar status:', err);
      if (veiculo.id.startsWith('mock-')) {
        setVeiculos((prev) =>
          prev.map((v) => (v.id === veiculo.id ? { ...v, status: novoStatus } : v))
        );
      } else {
        alert('Erro ao alterar status: ' + err.message);
      }
    }
  };

  // Abrir form para adicionar novo
  const handleAddNew = () => {
    setEditingVeiculo(null);
    setShowForm(true);
  };

  // Abrir form para editar existente
  const handleEdit = (veiculo: Veiculo) => {
    setEditingVeiculo(veiculo);
    setShowForm(true);
  };

  // Fechar form e atualizar lista
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingVeiculo(null);
    fetchStock();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVeiculo(null);
  };

  // Filtragem dos veículos conforme campo de pesquisa
  const filteredVeiculos = veiculos.filter((v) =>
    v.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tagsTipoMap = {
    van: 'Van',
    onibus: 'Ônibus',
    carro: 'Carro',
    motor: 'Motor',
  };

  return (
    <div className="space-y-6">
      {/* 1. Header do Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Estoque de Veículos</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie os anúncios, atualize preços, adicione fotos e controle o status do estoque.</p>
        </div>

        {!showForm && (
          <button
            onClick={handleAddNew}
            className="inline-flex items-center space-x-2 bg-accent text-primary font-bold hover:bg-accent-hover px-5 py-3 rounded-lg text-sm shadow transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Veículo</span>
          </button>
        )}
      </div>

      {/* 2. Formulário (se ativo) */}
      {showForm ? (
        <VehicleForm
          veiculoParaEditar={editingVeiculo}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <div className="space-y-4">
          {/* Caixa de Busca e Total */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-card p-4 rounded-xl border border-border">
            <div className="relative w-full sm:max-w-md">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Filtrar por marca, modelo ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border pl-10 pr-4 py-2.5 rounded-lg text-sm"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {filteredVeiculos.length} veículos exibidos
            </span>
          </div>

          {/* Estado de Carregamento */}
          {loading ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border space-y-4">
              <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto" />
              <span className="text-sm text-slate-500 font-semibold">Carregando catálogo...</span>
            </div>
          ) : filteredVeiculos.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border space-y-3">
              <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-slate-500 font-medium">Nenhum veículo cadastrado ou encontrado.</p>
              <button
                onClick={handleAddNew}
                className="inline-flex text-xs font-bold text-accent hover:underline uppercase tracking-wider"
              >
                Cadastrar o Primeiro Veículo
              </button>
            </div>
          ) : (
            /* Tabela de Gerenciamento */
            <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 border-b border-border text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="p-4 pl-6">Foto</th>
                      <th className="p-4">Veículo</th>
                      <th className="p-4 text-center">Tipo</th>
                      <th className="p-4 text-right">Preço</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 pr-6 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {filteredVeiculos.map((veiculo) => {
                      const foto = veiculo.fotos && veiculo.fotos.length > 0
                        ? veiculo.fotos[0].url_foto
                        : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=200';

                      const precoFormatado = new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(veiculo.preco);

                      return (
                        <tr key={veiculo.id} className="hover:bg-slate-500/5 transition-colors">
                          {/* Mini foto */}
                          <td className="p-4 pl-6 shrink-0">
                            <div className="h-12 w-20 rounded-lg overflow-hidden border border-border bg-slate-900">
                              <img src={foto} alt={veiculo.titulo} className="w-full h-full object-cover" />
                            </div>
                          </td>

                          {/* Título e especificações básicas */}
                          <td className="p-4 max-w-xs sm:max-w-sm">
                            <div className="font-bold text-foreground truncate">{veiculo.titulo}</div>
                            <div className="text-xs text-slate-400 truncate">
                              {veiculo.marca} • {veiculo.modelo} • {veiculo.ano_modelo} • {veiculo.quilometragem} km
                            </div>
                          </td>

                          {/* Tipo */}
                          <td className="p-4 text-center">
                            <span className="bg-primary-light/10 text-primary-light dark:bg-white/5 dark:text-gray-300 border border-primary-light/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                              {tagsTipoMap[veiculo.tipo]}
                            </span>
                          </td>

                          {/* Preço */}
                          <td className="p-4 text-right font-bold text-foreground">
                            {precoFormatado}
                          </td>

                          {/* Status */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleStatus(veiculo)}
                              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                veiculo.status === 'disponivel'
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                                  : 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20'
                              }`}
                              title="Clique para alterar status"
                            >
                              <span>{veiculo.status === 'disponivel' ? 'Disponível' : 'Vendido'}</span>
                            </button>
                          </td>

                          {/* Ações (Editar, Deletar) */}
                          <td className="p-4 pr-6 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(veiculo)}
                                className="p-2 bg-slate-500/5 hover:bg-accent hover:text-primary rounded-lg text-slate-400 hover:shadow transition-all"
                                title="Editar veículo"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(veiculo.id)}
                                className="p-2 bg-slate-500/5 hover:bg-red-600 hover:text-white rounded-lg text-slate-400 hover:shadow transition-all"
                                title="Excluir veículo"
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
        </div>
      )}
    </div>
  );
}
