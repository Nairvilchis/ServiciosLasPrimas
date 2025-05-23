import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Services } from '@/components/landing/Services';
import { PhotoCarousel } from '@/components/landing/PhotoCarousel'; // Import the new component
// import { Testimonials } from '@/components/landing/Testimonials'; // Remove import
import { ContactForm } from '@/components/landing/ContactForm';
import { Footer } from '@/components/landing/Footer';
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/button'; // Import Button

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <PhotoCarousel /> {/* Add the photo carousel */}
        {/* <Testimonials /> Remove component usage */}
        <ContactForm />

        { /* Temporary Admin Links - Consider moving to a dedicated admin section/layout 
        <div className="container mx-auto px-4 md:px-6 py-8 text-center border-t mt-10">
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Área de Administración (Temporal)</h3>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/services">Gestionar Servicios</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/gallery">Gestionar Fotos de Galería</Link>
            </Button>
            /* Direct links to add pages can still be useful */}
            {/*
             <Button asChild variant="link">
               <Link href="/admin/add-service">Añadir Servicio</Link>
             </Button>
             <Button asChild variant="link">
                <Link href="/admin/add-photo">Añadir Foto</Link>
             </Button>
              }
            
          </div>
        </div> */}
      </main>
      <Footer />
    </div>
  );
}
