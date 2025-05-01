'use client'; // Keep as client component for now to use hooks

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React, { useEffect, useState } from 'react'; // Import React
import { getServices } from '@/services/eventData'; // Import fetch function
import type { Service } from '@/lib/types'; // Import the Service type
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import * as LucideIcons from 'lucide-react'; // Import all lucide icons
import { PartyPopper as DefaultIcon } from 'lucide-react'; // Import default icon

// --- Helper for Icon Components ---
// Moved here as it's a client-side utility for rendering
// Define a type for icon names that exist in lucide-react
type LucideIconName = keyof typeof LucideIcons;

/**
 * Gets the Lucide icon component based on its name.
 * @param iconName - The name of the icon.
 * @returns The Lucide icon component or a default icon if not found.
 */
function getIconComponent(iconName: string | undefined): React.ElementType {
  if (!iconName) return DefaultIcon;
  // Check if the iconName is a valid key in LucideIcons
  const IconComponent = LucideIcons[iconName as LucideIconName];
  return IconComponent || DefaultIcon;
}
// --- End Icon Helper ---


export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadServices() {
      try {
        setIsLoading(true);
        const fetchedServices = await getServices();
        setServices(fetchedServices);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setError("Could not load services at this time.");
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <section id="services" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl mb-12 text-primary">
          Our Services
        </h2>

        {error && <p className="text-center text-destructive">{error}</p>}

        <Carousel
          opts={{
            align: "start",
            loop: services.length > 1, // Enable loop only if there's more than one service
          }}
          className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto" // Center the carousel
        >
          <CarouselContent>
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <CarouselItem key={`skeleton-${index}`} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="overflow-hidden shadow-lg h-full flex flex-col">
                        <CardHeader className="p-0 relative h-48 flex-shrink-0">
                          <Skeleton className="h-full w-full" />
                        </CardHeader>
                        <CardContent className="p-6 flex-grow space-y-2">
                           <Skeleton className="h-6 w-3/4" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))
              : services.map((service) => {
                  const IconComponent = getIconComponent(service.iconName); // Get the icon component
                  return (
                    <CarouselItem key={service.id} className="md:basis-1/2 lg:basis-1/3">
                       <div className="p-1 h-full"> {/* Add padding for spacing between items */}
                          <Card className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-secondary h-full flex flex-col group">
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
                                 {IconComponent && <IconComponent className="h-8 w-8 text-white mb-2" />}
                                 <CardTitle className="text-white">{service.title}</CardTitle>
                               </div>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow">
                              <p className="text-muted-foreground">{service.description}</p>
                            </CardContent>
                          </Card>
                      </div>
                    </CarouselItem>
                  );
                })}
          </CarouselContent>
          {services.length > 1 && ( // Show controls only if there's more than one item
            <>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </>
          )}
        </Carousel>
        {/* Optionally, add a link/button to an admin page for adding services */}
        {/* <div className="text-center mt-8">
             <Button asChild variant="outline">
               <Link href="/admin/add-service">Add New Service</Link>
             </Button>
           </div> */}
      </div>
    </section>
  );
}
