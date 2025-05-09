
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Services } from '@/components/landing/Services';
import { PhotoCarousel } from '@/components/landing/PhotoCarousel';
import { ContactForm } from '@/components/landing/ContactForm';
import { Footer } from '@/components/landing/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getServices } from '@/services/eventData'; // Import getServices
import type { Service } from '@/lib/types'; // Import Service type

export default async function Home() { // Make Home an async function
  const servicesList: Service[] = await getServices(); // Fetch services

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <PhotoCarousel />
        <ContactForm servicesList={servicesList} /> {/* Pass servicesList as a prop */}
      </main>
      <Footer />
    </div>
  );
}
