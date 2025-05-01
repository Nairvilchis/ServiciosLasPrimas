import Link from 'next/link';
import { PartyPopper } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <PartyPopper className="h-6 w-6 text-primary" />
          <span className="font-bold">Party Planners</span>
        </Link>
        {/* Basic Navigation can be added here later */}
        {/* <nav className="ml-auto flex items-center space-x-4">
          <Link href="#services">Servicios</Link>
          <Link href="#testimonials">Testimonios</Link>
          <Link href="#contact">Contacto</Link>
        </nav> */}
      </div>
    </header>
  );
}
