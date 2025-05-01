'use server';

import type { Service, GalleryPhoto } from '@/lib/types';

// --- Mock Data Store ---
// In a real application, this would interact with a database (e.g., Firestore).

let mockServices: Service[] = [
   {
     id: 'candy-bar',
     title: 'Candy Bar Delights',
     description: 'Customizable candy and dessert tables to sweeten any occasion. Choose your theme and treats!',
     iconName: 'UtensilsCrossed', // Represents food/sweets
     image: 'https://picsum.photos/seed/candybar/600/400',
     aiHint: 'candy bar dessert table',
   },
   {
     id: 'custom-cakes',
     title: 'Custom Cakes',
     description: 'From simple elegance to personalized masterpieces, we create cakes that taste as good as they look.',
     iconName: 'CakeSlice',
     image: 'https://picsum.photos/seed/cake/600/400',
     aiHint: 'wedding birthday cake',
   },
   {
     id: 'rentals',
     title: 'Table & Chair Rentals',
     description: 'Provide comfortable and stylish seating for your guests. Various styles available.',
     iconName: 'Armchair', // Changed from MapPin to Armchair
     image: 'https://picsum.photos/seed/rentals/600/400',
     aiHint: 'event table chair rental',
   },
   {
     id: 'open-bar',
     title: 'Open Bar Service',
     description: 'Professional bar service with a selection of drinks to keep the celebration flowing.',
     iconName: 'Wine',
     image: 'https://picsum.photos/seed/openbar/600/400',
     aiHint: 'cocktail bar drinks',
   },
 ];

let mockPhotos: GalleryPhoto[] = [
  {
    id: 'photo-1',
    src: 'https://picsum.photos/seed/party1/1200/800',
    alt: 'Colorful party setup with balloons',
    aiHint: 'party balloons decoration',
  },
  {
    id: 'photo-2',
    src: 'https://picsum.photos/seed/party2/1200/800',
    alt: 'Close up of a beautifully decorated cake',
    aiHint: 'decorated event cake',
  },
  {
    id: 'photo-3',
    src: 'https://picsum.photos/seed/party3/1200/800',
    alt: 'Guests enjoying drinks at an open bar',
    aiHint: 'party guests drinks',
  },
  {
    id: 'photo-4',
    src: 'https://picsum.photos/seed/party4/1200/800',
    alt: 'Elegant table setting for an event',
    aiHint: 'event table setting',
  },
  {
    id: 'photo-5',
    src: 'https://picsum.photos/seed/party5/1200/800',
    alt: 'Fun candy bar with various sweets',
    aiHint: 'candy bar sweets',
  },
];

// --- Service Functions ---

/**
 * Retrieves the list of services.
 * @returns A promise that resolves to an array of Service objects.
 */
export async function getServices(): Promise<Service[]> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 50));
  return [...mockServices]; // Return a copy
}

/**
 * Adds a new service.
 * @param serviceData - The data for the new service (excluding id).
 * @returns A promise that resolves to the newly created Service object.
 */
export async function addService(serviceData: Omit<Service, 'id'>): Promise<Service> {
   // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  const newId = serviceData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  const newService: Service = { ...serviceData, id: newId };
  mockServices.push(newService);
  console.log("Added Service:", newService); // Log for debugging
  return newService;
}

/**
 * Retrieves the list of gallery photos.
 * @returns A promise that resolves to an array of GalleryPhoto objects.
 */
export async function getPhotos(): Promise<GalleryPhoto[]> {
   // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 50));
  return [...mockPhotos]; // Return a copy
}

/**
 * Adds a new photo to the gallery.
 * @param photoData - The data for the new photo (excluding id). Requires src URL.
 * @returns A promise that resolves to the newly created GalleryPhoto object.
 */
export async function addPhoto(photoData: Omit<GalleryPhoto, 'id'>): Promise<GalleryPhoto> {
   // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  const newId = 'photo-' + Date.now();
  // Basic validation: Ensure src is provided
  if (!photoData.src || typeof photoData.src !== 'string' || !photoData.src.startsWith('http')) {
      throw new Error("Invalid photo source URL provided.");
  }
  const newPhoto: GalleryPhoto = { ...photoData, id: newId };
  mockPhotos.push(newPhoto);
  console.log("Added Photo:", newPhoto); // Log for debugging
  return newPhoto;
}


// Add more functions as needed (updateService, deleteService, updatePhoto, deletePhoto)
