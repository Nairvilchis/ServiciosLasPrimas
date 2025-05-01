
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
import Autoplay from "embla-carousel-autoplay" // Import Autoplay plugin

const photos = [
  {
    src: "https://picsum.photos/seed/party1/1200/800",
    alt: "Colorful party setup with balloons",
    aiHint: "party balloons decoration",
  },
  {
    src: "https://picsum.photos/seed/party2/1200/800",
    alt: "Close up of a beautifully decorated cake",
    aiHint: "decorated event cake",
  },
  {
    src: "https://picsum.photos/seed/party3/1200/800",
    alt: "Guests enjoying drinks at an open bar",
    aiHint: "party guests drinks",
  },
  {
    src: "https://picsum.photos/seed/party4/1200/800",
    alt: "Elegant table setting for an event",
    aiHint: "event table setting",
  },
  {
    src: "https://picsum.photos/seed/party5/1200/800",
    alt: "Fun candy bar with various sweets",
    aiHint: "candy bar sweets",
  },
];

export function PhotoCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true }) // Configure autoplay
  )

  return (
    <section id="gallery" className="py-20 md:py-28 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl mb-12 text-primary">
          Event Gallery
        </h2>
        <Carousel
          plugins={[plugin.current]} // Add plugin
          className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
           onMouseEnter={plugin.current.stop}
           onMouseLeave={plugin.current.reset}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {photos.map((photo, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/1"> {/* Adjust basis for desired display */}
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
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
