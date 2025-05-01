import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { getServices } from '@/services/eventData'; // Fetch services data
import type { Service, LucideIconName } from '@/lib/types'; // Import types

// Define a DefaultIcon component as a fallback
const DefaultIcon: React.ElementType = () => <LucideIcons.PartyPopper className="h-8 w-8 text-muted-foreground" />; // Example fallback

/**
 * Gets the Lucide icon component based on its name.
 * @param iconName - The name of the icon (must be a valid key in LucideIcons).
 * @returns The Lucide icon component (as React.ElementType) or a default icon if not found/invalid.
 */
function getIconComponent(iconName: LucideIconName | string | undefined): React.ElementType {
  if (!iconName) {
    return DefaultIcon;
  }

  // Check if iconName is a valid key in LucideIcons
  const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons];

  // Check if the retrieved item is likely a React component
  if (typeof IconComponent === 'function' || (typeof IconComponent === 'object' && IconComponent !== null && '$$typeof' in IconComponent)) {
    return IconComponent as React.ElementType;
  }

  // Fallback if the icon name is invalid or not found
  console.warn(`Ícono "${iconName}" no encontrado en LucideIcons o no es un componente válido. Usando ícono predeterminado.`);
  return DefaultIcon;
}

// Make Services a Server Component
export async function Services() {
  const services: Service[] = await getServices();

  return (
    <section id="services" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl mb-12 text-primary">
          Nuestros Servicios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => {
            const IconComponent = getIconComponent(service.iconName);
            return (
              <Card key={service.id} className="flex flex-col overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative h-48 w-full">
                  <Image
                    src={service.image}
                    alt={service.title}
                    layout="fill"
                    objectFit="cover"
                    className=""
                    data-ai-hint={service.aiHint}
                    unoptimized // If using picsum or other external non-configured domains
                  />
                </div>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pt-4 pb-2">
                   <div className="bg-primary/10 p-2 rounded-full">
                       <IconComponent className="h-6 w-6 text-primary" />
                   </div>
                   <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">{service.title}</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
