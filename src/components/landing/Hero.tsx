import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 bg-secondary/30 overflow-hidden">
      {/* Background elements */}
       <div className="absolute inset-0 opacity-10 pointer-events-none">
         {/* Placeholder for subtle background pattern/image */}
       </div>
       {/* Confetti-like elements */}
       <div className="absolute top-10 left-10 w-8 h-8 bg-primary rounded-full opacity-50 animate-pulse"></div>
       <div className="absolute bottom-20 right-20 w-12 h-12 bg-accent rounded-lg opacity-30 transform rotate-45 animate-bounce"></div>
       <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-secondary rounded-sm opacity-60 animate-spin-slow"></div>

      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-primary-foreground">
          ¡Vamos a Celebrar!
        </h1>
        <p className="mt-6 text-lg leading-8 text-secondary-foreground md:text-xl max-w-2xl mx-auto">
          Desde dulces delicias hasta montajes con estilo, Party Planners lleva la diversión a tu evento. Explora nuestros servicios y permítenos hacer tu celebración inolvidable.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform hover:scale-105">
            <Link href="#contact">Planea Tu Fiesta</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="shadow-md transition-transform hover:scale-105">
            <Link href="#services">Ver Nuestros Servicios</Link>
          </Button>
        </div>
      </div>
      {/* Optional: Add a subtle image or graphic */}
      {/* <Image
        src="https://picsum.photos/1920/500"
        alt="Party Background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 opacity-10"
        data-ai-hint="party celebration background"
      /> */}
    </section>
  );
}

// Add keyframes for animations in globals.css if needed, or use Tailwind's built-ins
// Example for spin-slow (add to tailwind.config.js if not present):
// animation: {
//   'spin-slow': 'spin 3s linear infinite',
// },
