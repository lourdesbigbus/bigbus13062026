'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { TipoVeiculo } from '@/types';

export default function AdvancedFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados locais para os filtros
  const [tipo, setTipo] = useState<string>('');
  const [marca, setMarca] = useState<string>('');
  const [anoMin, setAnoMin] = useState<string>('');
  const [anoMax, setAnoMax] = useState<string>('');
  const [precoMin, setPrecoMin] = useState<string>('');
  const [precoMax, setPrecoMax] = useState<string>('');
  
  const [isExpanded, setIsExpanded] = useState(false);

  // Sincronizar estados locais com a URL na inicialização
  useEffect(() => {
    setTipo(searchParams.get('tipo') || '');
    setMarca(searchParams.get('marca') || '');
    setAnoMin(searchParams.get('anoMin') || '');
    setAnoMax(searchParams.get('anoMax') || '');
    setPrecoMin(searchParams.get('precoMin') || '');
    setPrecoMax(searchParams.get('precoMax') || '');
  }, [searchParams]);

  // Aplicar filtros atualizando os searchParams da URL
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (tipo) params.set('tipo', tipo);
    if (marca) params.set('marca', marca);
    if (anoMin) params.set('anoMin', anoMin);
    if (anoMax) params.set('anoMax', anoMax);
    if (precoMin) params.set('precoMin', precoMin);
    if (precoMax) params.set('precoMax', precoMax);

    // Scroll suave até o catálogo ao aplicar
    router.push(`/?${params.toString()}#catalogo`, { scroll: false });
    const targetElement = document.getElementById('catalogo');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Limpar todos os filtros
  const handleClearFilters = () => {
    setTipo('');
    setMarca('');
    setAnoMin('');
    setAnoMax('');
    setPrecoMin('');
    setPrecoMax('');
    router.push('/', { scroll: false });
  };

  return (
    <div className="w-full bg-card text-card-foreground rounded-2xl shadow-lg border border-border overflow-hidden">
      {/* Cabeçalho do Filtro */}
      <div className="p-6 bg-primary-light border-b border-primary/20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-5 w-5 text-accent" />
          <h3 className="font-extrabold text-lg tracking-tight text-white">Filtro Avançado</h3>
        </div>
        <button
          onClick={handleClearFilters}
          className="text-xs font-semibold text-gray-300 hover:text-accent flex items-center space-x-1 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          <span>Limpar Filtros</span>
        </button>
      </div>

      {/* Formulário */}
      <form onSubmit={handleApplyFilters} className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Tipo de Veículo */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="tipo" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tipo de Veículo
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="bg-background text-foreground border border-border px-3 py-2.5 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent"
            >
              <option value="">Todos os tipos</option>
              <option value="van">Van Comercial</option>
              <option value="onibus">Ônibus</option>
              <option value="carro">Carro</option>
              <option value="motor">Motor Pesado</option>
            </select>
          </div>

          {/* Marca / Fabricante */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="marca" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Marca
            </label>
            <input
              id="marca"
              type="text"
              placeholder="Ex: Mercedes-Benz, Scania, Ford"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="bg-background text-foreground border border-border px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Faixa de Ano */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ano de Fabricação/Modelo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={anoMin}
                onChange={(e) => setAnoMin(e.target.value)}
                className="bg-background text-foreground border border-border px-3 py-2.5 rounded-lg text-sm text-center focus:ring-2 focus:ring-accent"
              />
              <input
                type="number"
                placeholder="Máx"
                value={anoMax}
                onChange={(e) => setAnoMax(e.target.value)}
                className="bg-background text-foreground border border-border px-3 py-2.5 rounded-lg text-sm text-center focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Faixa de Preço */}
          <div className="flex flex-col space-y-2 sm:col-span-2 lg:col-span-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Faixa de Preço (R$)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 text-sm font-semibold">R$ Mín</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={precoMin}
                  onChange={(e) => setPrecoMin(e.target.value)}
                  className="w-full bg-background text-foreground border border-border pl-16 pr-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 text-sm font-semibold">R$ Máx</span>
                <input
                  type="number"
                  placeholder="Sem limite"
                  value={precoMax}
                  onChange={(e) => setPrecoMax(e.target.value)}
                  className="w-full bg-background text-foreground border border-border pl-16 pr-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-accent text-primary font-bold hover:bg-accent-hover px-6 py-3 rounded-lg text-sm shadow transition-all duration-200"
          >
            <Search className="h-4 w-4" />
            <span>Pesquisar Estoque</span>
          </button>
        </div>
      </form>
    </div>
  );
}
