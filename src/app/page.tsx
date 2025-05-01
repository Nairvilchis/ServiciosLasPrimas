import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Services } from '@/components/landing/Services';
import { PhotoCarousel } from '@/components/landing/PhotoCarousel'; // Import the new component
import { Testimonials } from '@/components/landing/Testimonials';
import { ContactForm } from '@/components/landing/ContactForm';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <PhotoCarousel /> {/* Add the photo carousel */}
        <Testimonials />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
