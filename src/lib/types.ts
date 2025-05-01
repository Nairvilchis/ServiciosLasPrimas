import type React from 'react';

// Type for a service offered
export interface Service {
  id: string; // Unique identifier
  title: string;
  description: string;
  iconName: string; // Name of the lucide-react icon
  image: string; // URL for the service image
  aiHint: string; // Hint for AI image generation/search
}

// Type for a photo in the gallery
export interface GalleryPhoto {
  id: string; // Unique identifier
  src: string; // URL for the photo
  alt: string;
  aiHint: string; // Hint for AI image generation/search
}
