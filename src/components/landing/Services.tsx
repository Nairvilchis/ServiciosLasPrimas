import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, CakeSlice, Wine, MapPin } from 'lucide-react'; // MapPin as placeholder for tables/chairs

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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card key={service.title} className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-secondary">
              <CardHeader className="p-0 relative h-48">
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
              <CardContent className="p-6">
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}