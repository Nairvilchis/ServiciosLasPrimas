import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, CakeSlice, Wine, MapPin } from 'lucide-react'; // MapPin as placeholder for tables/chairs
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type React from 'react';

interface Service {
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
  aiHint: string;
}

const services: Service[] = [
  {
    title: 'Candy Bar Delights',
    description: 'Customizable candy and dessert tables to sweeten any occasion. Choose your theme and treats!',
    icon: UtensilsCrossed,
    image: 'https://picsum.photos/seed/candybar/600/400',
    aiHint: 'candy bar dessert table',
  },
  {
    title: 'Custom Cakes',
    description: 'From simple elegance to personalized masterpieces, we create cakes that taste as good as they look.',
    icon: CakeSlice,
    image: 'https://picsum.photos/seed/cake/600/400',
    aiHint: 'wedding birthday cake',
  },
  {
    title: 'Table & Chair Rentals',
    description: 'Provide comfortable and stylish seating for your guests. Various styles available.',
    icon: MapPin, // Using MapPin as placeholder, could use inline SVG for chair/table
    image: 'https://picsum.photos/seed/rentals/600/400',
    aiHint: 'event table chair rental',
  },
  {
    title: 'Open Bar Service',
    description: 'Professional bar service with a selection of drinks to keep the celebration flowing.',
    icon: Wine,
    image: 'https://picsum.photos/seed/openbar/600/400',
    aiHint: 'cocktail bar drinks',
  },
];

export function Services() {
  return (
    <section id="services" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl mb-12 text-primary">
          Our Services
        </h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto" // Center the carousel
        >
          <CarouselContent>
            {services.map((service) => (
              <CarouselItem key={service.title} className="md:basis-1/2 lg:basis-1/3">
                 <div className="p-1 h-full"> {/* Add padding for spacing between items */}
                    <Card className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-secondary h-full flex flex-col">
                      <CardHeader className="p-0 relative h-48 flex-shrink-0">
                        <Image
                          src={service.image}
                          alt={service.title}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint={service.aiHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                           <service.icon className="h-8 w-8 text-white mb-2" />
                           <CardTitle className="text-white">{service.title}</CardTitle>
                         </div>
                      </CardHeader>
                      <CardContent className="p-6 flex-grow">
                        <p className="text-muted-foreground">{service.description}</p>
                      </CardContent>
                    </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" /> {/* Hide on small screens */}
          <CarouselNext className="hidden sm:flex" /> {/* Hide on small screens */}
        </Carousel>
      </div>
    </section>
  );
}
