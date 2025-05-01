'use server';

import type { Service, GalleryPhoto } from '@/lib/types';

// --- Almacén de Datos Ficticio ---
// En una aplicación real, esto interactuaría con una base de datos (p.ej., Firestore).

let mockServices: Service[] = [
   {
     id: 'candy-bar',
     title: 'Delicias de Mesa de Dulces',
     description: 'Mesas de dulces y postres personalizables para endulzar cualquier ocasión. ¡Elige tu tema y golosinas!',
     iconName: 'UtensilsCrossed', // Representa comida/dulces
     image: 'https://picsum.photos/seed/candybar/600/400',
     aiHint: 'mesa de dulces postres',
   },
   {
     id: 'custom-cakes',
     title: 'Pasteles Personalizados',
     description: 'Desde elegancia simple hasta obras maestras personalizadas, creamos pasteles que saben tan bien como lucen.',
     iconName: 'CakeSlice',
     image: 'https://picsum.photos/seed/cake/600/400',
     aiHint: 'pastel boda cumpleaños',
   },
   {
     id: 'rentals',
     title: 'Renta de Mesas y Sillas',
     description: 'Proporciona asientos cómodos y elegantes para tus invitados. Varios estilos disponibles.',
     iconName: 'Armchair', // Changed from MapPin to Armchair
     image: 'https://picsum.photos/seed/rentals/600/400',
     aiHint: 'renta mesa silla evento',
   },
   {
     id: 'open-bar',
     title: 'Servicio de Barra Libre',
     description: 'Servicio de bar profesional con una selección de bebidas para mantener la celebración fluyendo.',
     iconName: 'Wine',
     image: 'https://picsum.photos/seed/openbar/600/400',
     aiHint: 'bar cocteles bebidas',
   },
 ];

let mockPhotos: GalleryPhoto[] = [
  {
    id: 'photo-1',
    src: 'https://picsum.photos/seed/party1/1200/800',
    alt: 'Montaje colorido de fiesta con globos',
    aiHint: 'fiesta globos decoración',
  },
  {
    id: 'photo-2',
    src: 'https://picsum.photos/seed/party2/1200/800',
    alt: 'Primer plano de un pastel bellamente decorado',
    aiHint: 'pastel decorado evento',
  },
  {
    id: 'photo-3',
    src: 'https://picsum.photos/seed/party3/1200/800',
    alt: 'Invitados disfrutando bebidas en una barra libre',
    aiHint: 'fiesta invitados bebidas',
  },
  {
    id: 'photo-4',
    src: 'https://picsum.photos/seed/party4/1200/800',
    alt: 'Montaje de mesa elegante para un evento',
    aiHint: 'montaje mesa evento',
  },
  {
    id: 'photo-5',
    src: 'https://picsum.photos/seed/party5/1200/800',
    alt: 'Divertida mesa de dulces con varias golosinas',
    aiHint: 'mesa dulces golosinas',
  },
];

// --- Funciones de Servicio ---

/**
 * Recupera la lista de servicios.
 * @returns Una promesa que se resuelve a un array de objetos Service.
 */
export async function getServices(): Promise<Service[]> {
  // Simula operación asíncrona
  await new Promise(resolve => setTimeout(resolve, 50));
  return [...mockServices]; // Devuelve una copia
}

/**
 * Recupera un solo servicio por su ID.
 * @param id - El ID del servicio a recuperar.
 * @returns Una promesa que se resuelve al objeto Service o null si no se encuentra.
 */
export async function getServiceById(id: string): Promise<Service | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const service = mockServices.find(s => s.id === id);
  return service ? { ...service } : null; // Devuelve una copia
}


/**
 * Añade un nuevo servicio.
 * @param serviceData - Los datos para el nuevo servicio (excluyendo id).
 * @returns Una promesa que se resuelve al objeto Service recién creado.
 */
export async function addService(serviceData: Omit<Service, 'id'>): Promise<Service> {
   // Simula operación asíncrona
  await new Promise(resolve => setTimeout(resolve, 100));
  const newId = serviceData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  const newService: Service = { ...serviceData, id: newId };
  mockServices.push(newService);
  console.log("Servicio Añadido:", newService); // Log para depuración
  return newService;
}

/**
 * Actualiza un servicio existente.
 * @param id - El ID del servicio a actualizar.
 * @param updateData - Un objeto que contiene los campos a actualizar.
 * @returns Una promesa que se resuelve al objeto Service actualizado o null si no se encuentra.
 */
export async function updateService(id: string, updateData: Partial<Omit<Service, 'id'>>): Promise<Service | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const serviceIndex = mockServices.findIndex(s => s.id === id);
  if (serviceIndex === -1) {
    return null;
  }
  // Fusiona los datos existentes con updateData
  mockServices[serviceIndex] = { ...mockServices[serviceIndex], ...updateData };
  console.log("Servicio Actualizado:", mockServices[serviceIndex]); // Log para depuración
  return { ...mockServices[serviceIndex] }; // Devuelve una copia
}

/**
 * Elimina un servicio.
 * @param id - El ID del servicio a eliminar.
 * @returns Una promesa que se resuelve a true si la eliminación fue exitosa, false en caso contrario.
 */
export async function deleteService(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const initialLength = mockServices.length;
  mockServices = mockServices.filter(s => s.id !== id);
  const success = mockServices.length < initialLength;
  if (success) {
    console.log("Servicio Eliminado con ID:", id); // Log para depuración
  }
  return success;
}


/**
 * Recupera la lista de fotos de la galería.
 * @returns Una promesa que se resuelve a un array de objetos GalleryPhoto.
 */
export async function getPhotos(): Promise<GalleryPhoto[]> {
   // Simula operación asíncrona
  await new Promise(resolve => setTimeout(resolve, 50));
  return [...mockPhotos]; // Devuelve una copia
}

/**
 * Recupera una sola foto por su ID.
 * @param id - El ID de la foto a recuperar.
 * @returns Una promesa que se resuelve al objeto GalleryPhoto o null si no se encuentra.
 */
export async function getPhotoById(id: string): Promise<GalleryPhoto | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const photo = mockPhotos.find(p => p.id === id);
  return photo ? { ...photo } : null; // Devuelve una copia
}


/**
 * Añade una nueva foto a la galería.
 * @param photoData - Los datos para la nueva foto (excluyendo id). Requiere URL src.
 * @returns Una promesa que se resuelve al objeto GalleryPhoto recién creado.
 */
export async function addPhoto(photoData: Omit<GalleryPhoto, 'id'>): Promise<GalleryPhoto> {
   // Simula operación asíncrona
  await new Promise(resolve => setTimeout(resolve, 100));
  const newId = 'photo-' + Date.now();
  // Validación básica: Asegura que se proporcione src
  if (!photoData.src || typeof photoData.src !== 'string' || !photoData.src.startsWith('http')) {
      throw new Error("URL de origen de foto inválida proporcionada.");
  }
  const newPhoto: GalleryPhoto = { ...photoData, id: newId };
  mockPhotos.push(newPhoto);
  console.log("Foto Añadida:", newPhoto); // Log para depuración
  return newPhoto;
}

/**
 * Actualiza una foto existente.
 * @param id - El ID de la foto a actualizar.
 * @param updateData - Un objeto que contiene los campos a actualizar.
 * @returns Una promesa que se resuelve al objeto GalleryPhoto actualizado o null si no se encuentra.
 */
export async function updatePhoto(id: string, updateData: Partial<Omit<GalleryPhoto, 'id'>>): Promise<GalleryPhoto | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const photoIndex = mockPhotos.findIndex(p => p.id === id);
  if (photoIndex === -1) {
    return null;
  }
   // Validación básica para src si se proporciona
   if (updateData.src && (typeof updateData.src !== 'string' || !updateData.src.startsWith('http'))) {
     throw new Error("URL de origen de foto inválida proporcionada para la actualización.");
   }
  // Fusiona los datos existentes con updateData
  mockPhotos[photoIndex] = { ...mockPhotos[photoIndex], ...updateData };
  console.log("Foto Actualizada:", mockPhotos[photoIndex]); // Log para depuración
  return { ...mockPhotos[photoIndex] }; // Devuelve una copia
}

/**
 * Elimina una foto.
 * @param id - El ID de la foto a eliminar.
 * @returns Una promesa que se resuelve a true si la eliminación fue exitosa, false en caso contrario.
 */
export async function deletePhoto(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const initialLength = mockPhotos.length;
  mockPhotos = mockPhotos.filter(p => p.id !== id);
  const success = mockPhotos.length < initialLength;
  if (success) {
     console.log("Foto Eliminada con ID:", id); // Log para depuración
  }
  return success;
}

// Añade más funciones según sea necesario
