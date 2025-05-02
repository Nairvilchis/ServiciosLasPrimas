
"use client"; // Required for Embla Carousel and React hooks

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay"; // Import Autoplay plugin
import { useEffect, useState } from 'react';
import { getPhotos } from '@/services/eventData'; // Import fetch function
import type { GalleryPhoto } from '@/lib/types'; // Import the GalleryPhoto type
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

export function PhotoCarousel() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true }) // Configure autoplay
  );

  useEffect(() => {
    async function loadPhotos() {
      try {
        setIsLoading(true);
        const fetchedPhotos = await getPhotos();
        console.log("Fetched photos:", fetchedPhotos); // Added console log
        setPhotos(fetchedPhotos);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch photos:", err);
        setError("No se pudieron cargar las fotos de la galería en este momento.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPhotos();
  }, []); // Empty dependency array means this runs once on mount


  return (
    <section id="gallery" className="py-20 md:py-28 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl mb-12 text-primary">
          Galería de Eventos
        </h2>

        {error && <p className="text-center text-destructive">{error}</p>}

        <Carousel
          plugins={[plugin.current]} // Add plugin
          className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
           onMouseEnter={plugin.current.stop}
           onMouseLeave={plugin.current.reset}
          opts={{
            align: "start",
            loop: photos.length > 1, // Enable loop only if there's more than one photo
          }}
        >
          <CarouselContent>
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <CarouselItem key={`skeleton-${index}`} className="md:basis-1/2 lg:basis-1/1">
                    <div className="p-1">
                      <Card className="overflow-hidden shadow-md">
                        <CardContent className="flex aspect-[3/2] items-center justify-center p-0">
                           <Skeleton className="h-full w-full" />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))
              : photos.map((photo, index) => (
                  <CarouselItem key={photo.id} className="md:basis-1/2 lg:basis-1/1"> {/* Adjust basis for desired display */}
                    <div className="p-1">
                      <Card className="overflow-hidden shadow-md">
                        <CardContent className="flex aspect-[3/2] items-center justify-center p-0"> {/* Use aspect ratio */}
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            width={1200}
                            height={800}
                            className="object-cover w-full h-full"
                            data-ai-hint={photo.aiHint}
                            priority={index === 0} // Prioritize loading the first image
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
              ))}
          </CarouselContent>
           {photos.length > 1 && ( // Show controls only if there's more than one item
            <>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </>
           )}
        </Carousel>
         {/* Optionally, add a link/button to an admin page for adding photos */}
        {/* <div className="text-center mt-8">
             <Button asChild variant="outline">
               <Link href="/admin/add-photo">Add New Photo</Link>
             </Button>
           </div> */}
      </div>
    </section>
  );
}
