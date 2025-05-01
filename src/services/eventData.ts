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
 * Retrieves a single service by its ID.
 * @param id - The ID of the service to retrieve.
 * @returns A promise that resolves to the Service object or null if not found.
 */
export async function getServiceById(id: string): Promise<Service | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const service = mockServices.find(s => s.id === id);
  return service ? { ...service } : null; // Return a copy
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
 * Updates an existing service.
 * @param id - The ID of the service to update.
 * @param updateData - An object containing the fields to update.
 * @returns A promise that resolves to the updated Service object or null if not found.
 */
export async function updateService(id: string, updateData: Partial<Omit<Service, 'id'>>): Promise<Service | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const serviceIndex = mockServices.findIndex(s => s.id === id);
  if (serviceIndex === -1) {
    return null;
  }
  // Merge existing data with updateData
  mockServices[serviceIndex] = { ...mockServices[serviceIndex], ...updateData };
  console.log("Updated Service:", mockServices[serviceIndex]); // Log for debugging
  return { ...mockServices[serviceIndex] }; // Return a copy
}

/**
 * Deletes a service.
 * @param id - The ID of the service to delete.
 * @returns A promise that resolves to true if deletion was successful, false otherwise.
 */
export async function deleteService(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const initialLength = mockServices.length;
  mockServices = mockServices.filter(s => s.id !== id);
  const success = mockServices.length < initialLength;
  if (success) {
    console.log("Deleted Service with ID:", id); // Log for debugging
  }
  return success;
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
 * Retrieves a single photo by its ID.
 * @param id - The ID of the photo to retrieve.
 * @returns A promise that resolves to the GalleryPhoto object or null if not found.
 */
export async function getPhotoById(id: string): Promise<GalleryPhoto | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const photo = mockPhotos.find(p => p.id === id);
  return photo ? { ...photo } : null; // Return a copy
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

/**
 * Updates an existing photo.
 * @param id - The ID of the photo to update.
 * @param updateData - An object containing the fields to update.
 * @returns A promise that resolves to the updated GalleryPhoto object or null if not found.
 */
export async function updatePhoto(id: string, updateData: Partial<Omit<GalleryPhoto, 'id'>>): Promise<GalleryPhoto | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const photoIndex = mockPhotos.findIndex(p => p.id === id);
  if (photoIndex === -1) {
    return null;
  }
   // Basic validation for src if provided
   if (updateData.src && (typeof updateData.src !== 'string' || !updateData.src.startsWith('http'))) {
     throw new Error("Invalid photo source URL provided for update.");
   }
  // Merge existing data with updateData
  mockPhotos[photoIndex] = { ...mockPhotos[photoIndex], ...updateData };
  console.log("Updated Photo:", mockPhotos[photoIndex]); // Log for debugging
  return { ...mockPhotos[photoIndex] }; // Return a copy
}

/**
 * Deletes a photo.
 * @param id - The ID of the photo to delete.
 * @returns A promise that resolves to true if deletion was successful, false otherwise.
 */
export async function deletePhoto(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const initialLength = mockPhotos.length;
  mockPhotos = mockPhotos.filter(p => p.id !== id);
  const success = mockPhotos.length < initialLength;
  if (success) {
     console.log("Deleted Photo with ID:", id); // Log for debugging
  }
  return success;
}

// Add more functions as needed
