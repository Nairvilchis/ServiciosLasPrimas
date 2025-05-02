'use server';
// Indica que este archivo se ejecuta en el servidor. Esto es relevante en frameworks como Next.js para diferenciar entre código del cliente y del servidor.

import mongoose from 'mongoose';
// Importa la biblioteca Mongoose, que se utiliza para interactuar con MongoDB.

import type { Service, GalleryPhoto } from '@/lib/types';
// Importa los tipos `Service` y `GalleryPhoto` desde el archivo de tipos. Esto asegura que los datos cumplan con las interfaces definidas.

import { connectDB } from '@/config/db';
// Importa la función `connectDB` desde el archivo de configuración de la base de base de datos. Esta función se encarga de establecer la conexión con MongoDB.

connectDB();
// Llama a la función `connectDB` para conectar a la base de datos MongoDB al cargar este archivo.

// --- Definición de Esquemas y Modelos ---
const serviceSchema = new mongoose.Schema<Service>({
  id: { type: String, required: true, unique: true },
  // Define un campo `id` de tipo String, obligatorio y único. Este campo identifica de manera única cada servicio.
  title: { type: String, required: true },
  // Define un campo `title` de tipo String, obligatorio. Representa el título del servicio.
  description: { type: String, required: true },
  // Define un campo `description` de tipo String, obligatorio. Contiene la descripción del servicio.
  iconName: { type: String, required: true },
  // Define un campo `iconName` de tipo String, obligatorio. Almacena el nombre del ícono asociado al servicio.
  image: { type: String, required: true },
  // Define un campo `image` de tipo String, obligatorio. Contiene la URL de la imagen del servicio.
  aiHint: { type: String, required: true },
  // Define un campo `aiHint` de tipo String, obligatorio. Proporciona una pista para la generación de imágenes con IA.
});

const photoSchema = new mongoose.Schema<GalleryPhoto>({
  id: { type: String, required: true, unique: true },
  // Define un campo `id` de tipo String, obligatorio y único. Este campo identifica de manera única cada foto.
  src: { type: String, required: true },
  // Define un campo `src` de tipo String, obligatorio. Contiene la URL de la foto.
  alt: { type: String, required: true },
  // Define un campo `alt` de tipo String, obligatorio. Contiene el texto alternativo de la foto.
  aiHint: { type: String, required: true },
  // Define un campo `aiHint` de tipo String, obligatorio. Proporciona una pista para la generación de imágenes con IA.
});

const ServiceModel = mongoose.models.Service || mongoose.model<Service>('Service', serviceSchema);
// Crea un modelo de Mongoose llamado `Service` basado en el esquema `serviceSchema`. Este modelo se utiliza para interactuar con la colección `Service` en MongoDB.

const PhotoModel = mongoose.models.GalleryPhoto || mongoose.model<GalleryPhoto>('GalleryPhoto', photoSchema);
// Crea un modelo de Mongoose llamado `GalleryPhoto` basado en el esquema `photoSchema`. Este modelo se utiliza para interactuar con la colección `GalleryPhoto` en MongoDB.

// --- Funciones de Servicio ---
export async function getServices(): Promise<Service[]> {
  console.log("Attempting to fetch services");
  const services = await ServiceModel.find().lean();
  console.log("Fetched services:", services); // Added console log
  // Convert Mongoose documents to plain objects
  const plainServices = JSON.parse(JSON.stringify(services));
  return plainServices as Service[];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const service = await ServiceModel.findOne({ id }).lean();
   // Convert Mongoose document to plain object
  const plainService = JSON.parse(JSON.stringify(service));
  return plainService as Service | null;
}

export async function addService(serviceData: Omit<Service, 'id'>): Promise<Service> {
  const newId = serviceData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  const newService = new ServiceModel({ ...serviceData, id: newId });
  await newService.save();
  console.log('Servicio Añadido:', newService);
  // Convert Mongoose document to plain object
  const plainNewService = JSON.parse(JSON.stringify(newService));
  return plainNewService as Service;
}

export async function updateService(id: string, updateData: Partial<Omit<Service, 'id'>>): Promise<Service | null> {
  const updatedService = await ServiceModel.findOneAndUpdate({ id }, updateData, { new: true }).lean();
  if (updatedService) {
    console.log('Servicio Actualizado:', updatedService);
     // Convert Mongoose document to plain object
    const plainUpdatedService = JSON.parse(JSON.stringify(updatedService));
     return plainUpdatedService as Service;
  }
  return null;
}

export async function deleteService(id: string): Promise<boolean> {
  const result = await ServiceModel.deleteOne({ id });
  if (result.deletedCount > 0) {
    console.log('Servicio Eliminado con ID:', id);
    return true;
  }
  return false;
}

// --- Funciones de Fotos ---
export async function getPhotos(): Promise<GalleryPhoto[]> {
  const photos = await PhotoModel.find().lean();
  console.log("Fetched photos:", photos); // Added console log
   // Convert Mongoose documents to plain objects
  const plainPhotos = JSON.parse(JSON.stringify(photos));
  return plainPhotos as GalleryPhoto[];
}

export async function getPhotoById(id: string): Promise<GalleryPhoto | null> {
  const photo = await PhotoModel.findOne({ id }).lean();
   // Convert Mongoose document to plain object
  const plainPhoto = JSON.parse(JSON.stringify(photo));
  return plainPhoto as GalleryPhoto | null;
}

export async function addPhoto(photoData: Omit<GalleryPhoto, 'id'>): Promise<GalleryPhoto> {
  const newId = 'photo-' + Date.now();
  if (!photoData.src || typeof photoData.src !== 'string' || !photoData.src.startsWith('http')) {
    throw new Error('URL de origen de foto inválida proporcionada.');
  }
  const newPhoto = new PhotoModel({ ...photoData, id: newId });
  await newPhoto.save();
  console.log('Foto Añadida:', newPhoto);
   // Convert Mongoose document to plain object
  const plainNewPhoto = JSON.parse(JSON.stringify(newPhoto));
  return plainNewPhoto as GalleryPhoto;
}

export async function updatePhoto(id: string, updateData: Partial<Omit<GalleryPhoto, 'id'>>): Promise<GalleryPhoto | null> {
  if (updateData.src && (typeof updateData.src !== 'string' || !updateData.src.startsWith('http'))) {
    throw new Error('URL de origen de foto inválida proporcionada para la actualización.');
  }
  const updatedPhoto = await PhotoModel.findOneAndUpdate({ id }, updateData, { new: true }).lean();
  if (updatedPhoto) {
    console.log('Foto Actualizada:', updatedPhoto);
     // Convert Mongoose document to plain object
    const plainUpdatedPhoto = JSON.parse(JSON.stringify(updatedPhoto));
     return plainUpdatedPhoto as GalleryPhoto;
  }
  return null;
}

export async function deletePhoto(id: string): Promise<boolean> {
  const result = await PhotoModel.deleteOne({ id });
  if (result.deletedCount > 0) {
    console.log('Foto Eliminada con ID:', id);
    return true;
  }
  return false;
}
