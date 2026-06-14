'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShieldAlert, Phone, Truck, KeyRound } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Ocultar Navbar pública nas rotas administrativa e login
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Vans', href: '/#catalogo?tipo=van' },
    { name: 'Ônibus', href: '/#catalogo?tipo=onibus' },
    { name: 'Carros', href: '/#catalogo?tipo=carro' },
    { name: 'Motores', href: '/#catalogo?tipo=motor' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-primary/95 text-white border-b border-primary-light/50 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-accent p-2.5 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Truck className="h-6 w-6 text-primary font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight uppercase block">
                Big<span className="text-accent">Bus</span>
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 block -mt-1">
                25 Anos de Tradição
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-accent transition-colors duration-200 py-2"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions & Admin Link */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-gray-300 hover:text-accent transition-colors py-2 px-3 rounded-full hover:bg-white/5"
            >
              <Phone className="h-4 w-4" />
              <span>(11) 99999-9999</span>
            </a>
            <Link
              href="/login"
              className="flex items-center space-x-2 bg-primary-light border border-gray-700 text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <KeyRound className="h-4 w-4 text-accent" />
              <span>Área Admin</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-primary-light/50 bg-primary/98 py-4 px-6 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-accent py-2 text-base font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-primary-light" />
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-300 hover:text-accent py-2"
              onClick={() => setIsOpen(false)}
            >
              <Phone className="h-5 w-5" />
              <span>(11) 99999-9999</span>
            </a>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center space-x-2 bg-accent text-primary font-semibold hover:bg-accent-hover py-3 rounded-lg text-sm transition-all"
            >
              <KeyRound className="h-4 w-4" />
              <span>Entrar no Painel</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
