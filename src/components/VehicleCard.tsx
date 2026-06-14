'use client';

import Link from 'next/link';
import { Veiculo } from '@/types';
import { Calendar, Gauge, Fuel, ArrowUpRight, Tag } from 'lucide-react';

interface VehicleCardProps {
  veiculo: Veiculo;
}

export default function VehicleCard({ veiculo }: VehicleCardProps) {
  // Obter foto principal ou imagem padrão/placeholder
  const fotoPrincipal =
    veiculo.fotos && veiculo.fotos.length > 0
      ? veiculo.fotos[0].url_foto
      : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600'; // Default placeholder photo for heavy vehicles

  // Formatar preço em R$
  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(veiculo.preco);

  // Formatar quilometragem
  const kmFormatada = new Intl.NumberFormat('pt-BR').format(veiculo.quilometragem);

  const tagsTipoMap = {
    van: 'Van Comercial',
    onibus: 'Ônibus',
    carro: 'Carro',
    motor: 'Motor Pesado',
  };

  const statusMap = {
    disponivel: { label: 'Disponível', css: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    vendido: { label: 'Vendido', css: 'bg-red-500/10 text-red-600 border-red-500/20' },
  };

  return (
    <div className="group bg-card text-card-foreground rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Imagem do veículo */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={fotoPrincipal}
          alt={veiculo.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badge do Tipo de Veículo */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-primary/90 text-white backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase border border-primary-light/30">
          <Tag className="h-3 w-3 text-accent" />
          <span>{tagsTipoMap[veiculo.tipo] || veiculo.tipo}</span>
        </div>

        {/* Badge do Status (se vendido) */}
        {veiculo.status === 'vendido' && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider shadow">
            {statusMap.vendido.label}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            {veiculo.marca} • {veiculo.modelo}
          </div>
          <h3 className="font-bold text-lg text-foreground line-clamp-1 leading-snug group-hover:text-accent transition-colors">
            {veiculo.titulo}
          </h3>

          {/* Grid de especificações rápidas */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 text-xs text-slate-500 font-medium">
            <div className="flex items-center space-x-1.5">
              <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>{veiculo.ano_modelo}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Gauge className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="truncate">{kmFormatada} km</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Fuel className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="truncate">{veiculo.combustivel}</span>
            </div>
          </div>
        </div>

        {/* Preço e link de ação */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Preço Especial</span>
            <span className="text-xl font-extrabold text-foreground tracking-tight">{precoFormatado}</span>
          </div>

          <Link
            href={`/veiculos/${veiculo.id}`}
            className="inline-flex items-center justify-center p-2.5 rounded-lg bg-primary-light/50 border border-border/80 text-foreground hover:bg-accent hover:text-primary hover:border-accent font-semibold transition-all duration-200"
          >
            <span className="text-xs mr-1">Ver Detalhes</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
