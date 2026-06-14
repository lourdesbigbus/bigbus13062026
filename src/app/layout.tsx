import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'BigBus - Compra, Venda, Troca e Financiamento de Veículos Pesados',
  description:
    'Líder no mercado há mais de 25 anos, a BigBus oferece as melhores condições em Vans, Ônibus, Carros e Motores. Compre com segurança e solidez.',
  keywords: 'ônibus, vans, caminhões, carros, motores pesados, financiamento de veículos, comprar ônibus',
  openGraph: {
    title: 'BigBus - Especialista em Veículos Pesados e Comerciais',
    description: 'Mais de 25 anos de tradição em venda, troca e financiamento de Vans, Ônibus, Carros e Motores.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Header />
        <main className="flex-grow flex flex-col w-full">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
