import Link from 'next/link';
import { PartyPopper, Mail, Phone, Settings } from 'lucide-react'; // Added Settings
import { getSiteSettings } from '@/services/eventData'; // Import fetch function
import type { SiteSetting } from '@/lib/types'; // Import type

export async function Footer() { // Make it an async Server Component
  let settings: SiteSetting;
  try {
    settings = await getSiteSettings();
  } catch (error) {
    console.error("Error al cargar la configuración del sitio para el pie de página:", error);
    // Fallback default settings if fetching fails
    settings = {
      id: 'default-fallback',
      whatsappNumber: '1234567890',
      contactEmail: 'contacto@servicioslasprimas.com',
      contactPhone: '+52 999 123 4567',
      copyrightText: `© ${new Date().getFullYear()} Servicios Las Primas. Todos los derechos reservados.`
    };
  }

  const copyrightText = settings.copyrightText || `© ${new Date().getFullYear()} Servicios Las Primas. Todos los derechos reservados.`;

  return (
    <footer className="bg-muted text-muted-foreground py-8">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <PartyPopper className="h-5 w-5 text-primary" />
          <span className="text-sm">{copyrightText}</span>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 items-center">
           <Link href={`mailto:${settings.contactEmail}`} className="text-sm hover:text-primary transition-colors flex items-center gap-1">
              <Mail size={16} /> {settings.contactEmail}
            </Link>
           <Link href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} className="text-sm hover:text-primary transition-colors flex items-center gap-1">
             <Phone size={16} /> {settings.contactPhone}
            </Link>
        </div>
      </div>
    </footer>
  );
}
