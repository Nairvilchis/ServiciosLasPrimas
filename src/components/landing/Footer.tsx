import Link from 'next/link';
import { PartyPopper, Mail, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted text-muted-foreground py-8">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <PartyPopper className="h-5 w-5 text-primary" />
          <span className="text-sm">&copy; {currentYear} Servicios Las Primas. Todos los derechos reservados.</span>
        </div>
        <div className="flex space-x-6">
           {/* Add actual contact info later */}
           <Link href="cotizaciones@servicioslasprimas.shop" className="text-sm hover:text-primary transition-colors flex items-center gap-1">
              <Mail size={16} /> cotizaciones@servicioslasprimas.shop
            </Link>
           <Link href="tel:+529995106213" className="text-sm hover:text-primary transition-colors flex items-center gap-1">
             <Phone size={16} /> +52 (999) 510-6213
            </Link>
           {/* Optional: Social Media Links */}
           {/* <Link href="#" className="text-sm hover:text-primary transition-colors">Facebook</Link>
           <Link href="#" className="text-sm hover:text-primary transition-colors">Instagram</Link> */}
        </div>
      </div>
    </footer>
  );
}
