'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { FotoVeiculo } from '@/types';

interface GalleryCarouselProps {
  fotos?: FotoVeiculo[];
  titulo: string;
}

export default function GalleryCarousel({ fotos = [], titulo }: GalleryCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback se não houver fotos cadastradas
  const imagens = fotos.length > 0 
    ? fotos.map(f => f.url_foto)
    : ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200'];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? imagens.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === imagens.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Visualização de Imagem Principal */}
      <div className="relative aspect-video sm:aspect-[4/3] md:aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden border border-border group shadow-md">
        <img
          src={imagens[activeIndex]}
          alt={`${titulo} - Foto ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-500"
        />

        {/* Botão Prev */}
        {imagens.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary/80 text-white p-2 rounded-full backdrop-blur-sm border border-primary-light/50 hover:bg-accent hover:text-primary transition-all shadow opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Botão Next */}
        {imagens.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/80 text-white p-2 rounded-full backdrop-blur-sm border border-primary-light/50 hover:bg-accent hover:text-primary transition-all shadow opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Indicador de Quantidade */}
        <div className="absolute bottom-4 right-4 bg-primary/85 text-white backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider flex items-center space-x-1.5 border border-primary-light/30 shadow">
          <ImageIcon className="h-3.5 w-3.5 text-accent" />
          <span>{activeIndex + 1} / {imagens.length}</span>
        </div>
      </div>

      {/* Miniaturas (Thumbnails) */}
      {imagens.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {imagens.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 aspect-video rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                index === activeIndex
                  ? 'border-accent scale-[0.98] shadow-inner'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${titulo} Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
