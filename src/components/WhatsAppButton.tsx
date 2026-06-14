'use client';

import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Ocultar o botão flutuante nas rotas de administração e de login
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  const telefone = '5511999999999'; // Substitua pelo número real da BigBus
  const mensagem = encodeURIComponent(
    'Olá! Estava navegando no portal da BigBus e gostaria de mais informações sobre os veículos.'
  );
  const whatsappUrl = `https://wa.me/${telefone}?text=${mensagem}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
      {/* Círculo com efeito de onda (pulsar) de atenção */}
      <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-emerald-500 opacity-25" />
      
      {/* Botão Principal */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center h-14 w-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Fale conosco pelo WhatsApp"
      >
        {/* Ícone Oficial do WhatsApp em SVG */}
        <svg
          className="w-7 h-7 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.451 5.42 1.452 5.56 0 10.082-4.52 10.085-10.081.002-2.694-1.043-5.227-2.946-7.13C17.29 1.49 14.76 1.447 12.07 1.447c-5.563 0-10.085 4.52-10.088 10.083-.001 1.93.502 3.81 1.453 5.416L1.87 22.13l5.34-1.4c1.61.876 3.413 1.339 5.284 1.34h.005zm10.748-7.382c-.295-.148-1.748-.863-2.018-.962-.27-.099-.467-.148-.662.148-.195.297-.757.962-.927 1.16-.17.196-.341.22-.636.072-.295-.148-1.248-.46-2.378-1.467-.88-.785-1.474-1.754-1.647-2.05-.173-.296-.018-.456.13-.603.132-.133.296-.346.444-.519.148-.173.197-.297.296-.495.099-.198.05-.371-.025-.519-.075-.148-.662-1.597-.907-2.186-.24-.576-.482-.497-.662-.506-.17-.008-.367-.01-.563-.01-.197 0-.518.074-.789.37-.27.297-1.03 1.012-1.03 2.47 0 1.457 1.06 2.864 1.208 3.062.148.198 2.086 3.186 5.055 4.471.706.307 1.258.49 1.687.626.709.226 1.354.194 1.864.118.57-.085 1.748-.715 1.993-1.405.246-.69.246-1.284.173-1.405-.074-.121-.27-.197-.564-.346z" />
        </svg>

        {/* Mini tooltip descritivo ao passar o mouse */}
        <span className="absolute right-16 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none transition-all duration-200">
          Chame no WhatsApp
        </span>
      </a>
    </div>
  );
}
