'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Ocultar Footer público nas rotas administrativa e login
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-gray-400 border-t border-primary-light/40">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Tradition */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-3 text-white group">
              <div className="relative h-12 w-12 shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_6px_rgba(245,158,11,0.2)]">
                <img src="/logo.svg" alt="BigBus Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-xl tracking-tight uppercase group-hover:text-accent transition-colors">
                Big<span className="text-accent">Bus</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Desde 2001 facilitando a compra, venda, troca e financiamento de veículos pesados e comerciais. Confiança que roda o Brasil inteiro.
            </p>
            <div className="inline-flex items-center space-x-2 bg-primary-light/50 px-3 py-1.5 rounded-full border border-primary-light text-xs text-accent">
              <Calendar className="h-3.5 w-3.5" />
              <span>Mais de 25 Anos no Mercado</span>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Categorias</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#catalogo?tipo=van" className="hover:text-white transition-colors">Vans Comerciais</Link>
              </li>
              <li>
                <Link href="/#catalogo?tipo=onibus" className="hover:text-white transition-colors">Ônibus e Micro-ônibus</Link>
              </li>
              <li>
                <Link href="/#catalogo?tipo=carro" className="hover:text-white transition-colors">Carros de Passeio</Link>
              </li>
              <li>
                <Link href="/#catalogo?tipo=motor" className="hover:text-white transition-colors">Motores Pesados</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Institucional</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Quem Somos</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">Como Comprar</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">Financiamento</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">Portal do Administrador</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3.5 text-sm">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Contato</h3>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <span>Rod. Presidente Dutra, KM 220 - Guarulhos / SP</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-accent shrink-0" />
              <span>(11) 99999-9999 / (11) 4002-8922</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-accent shrink-0" />
              <span>contato@bigbusveiculos.com.br</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="bg-primary-light/40 py-6 border-t border-primary-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {currentYear} BigBus Veículos Pesados Ltda. Todos os direitos reservados.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link href="/" className="hover:text-white transition-colors">Política de Privacidade</Link>
            <span>•</span>
            <Link href="/" className="hover:text-white transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
