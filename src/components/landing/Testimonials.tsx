import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  title: string;
  quote: string;
  avatar: string; // URL or path to avatar image
  aiHint: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah L.',
    title: 'Birthday Party Host',
    quote: 'The candy bar was a massive hit! Absolutely stunning and delicious. Party Planners made everything so easy.',
    avatar: 'https://picsum.photos/seed/avatar1/100/100',
    aiHint: 'happy woman portrait',
    rating: 5,
  },
  {
    name: 'Michael B.',
    title: 'Wedding Groom',
    quote: 'Our wedding cake was beyond perfect. They captured our vision exactly and it tasted incredible. Highly recommend!',
    avatar: 'https://picsum.photos/seed/avatar2/100/100',
    aiHint: 'smiling man portrait',
    rating: 5,
  },
  {
    name: 'Emily R.',
    title: 'Corporate Event Planner',
    quote: 'Reliable rentals and excellent service. The tables and chairs were clean and set up efficiently. Will use again!',
    avatar: 'https://picsum.photos/seed/avatar3/100/100',
    aiHint: 'professional woman portrait',
    rating: 4,
  },
];

const renderStars = (rating: number) => {
  return Array(5).fill(0).map((_, i) => (
    <Star
      key={i}
      className={`h-5 w-5 ${i < rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
    />
  ));
};

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl mb-12 text-primary">
          Happy Clients
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="flex flex-col justify-between shadow-md bg-card">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                 <Avatar>
                   <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.aiHint}/>
                   <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                 </Avatar>
                 <div className="flex flex-col">
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                 </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="italic text-foreground/80">"{testimonial.quote}"</p>
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <div className="flex items-center gap-1">
                   {renderStars(testimonial.rating)}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}