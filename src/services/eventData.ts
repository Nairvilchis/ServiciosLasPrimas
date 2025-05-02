'use server';
// Indica que este archivo se ejecuta en el servidor. Esto es relevante en frameworks como Next.js para diferenciar entre código del cliente y del servidor.

import mongoose from 'mongoose';
// Importa la biblioteca Mongoose, que se utiliza para interactuar con MongoDB.

import type { Service, GalleryPhoto } from '@/lib/types';
// Importa los tipos `Service` y `GalleryPhoto` desde el archivo de tipos. Esto asegura que los datos cumplan con las interfaces definidas.

import { connectDB } from '@/config/db';
// Importa la función `connectDB` desde el archivo de configuración de la base de datos. Esta función se encarga de establecer la conexión con MongoDB.

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

const ServiceModel = mongoose.model<Service>('Service', serviceSchema);
// Crea un modelo de Mongoose llamado `Service` basado en el esquema `serviceSchema`. Este modelo se utiliza para interactuar con la colección `Service` en MongoDB.

const PhotoModel = mongoose.model<GalleryPhoto>('GalleryPhoto', photoSchema);
// Crea un modelo de Mongoose llamado `GalleryPhoto` basado en el esquema `photoSchema`. Este modelo se utiliza para interactuar con la colección `GalleryPhoto` en MongoDB.

// --- Funciones de Servicio ---
export async function getServices(): Promise<Service[]> {
  return await ServiceModel.find().lean();
  // Recupera todos los documentos de la colección `Service` y los devuelve como objetos planos (sin métodos de Mongoose).
}

export async function getServiceById(id: string): Promise<Service | null> {
  return await ServiceModel.findOne({ id }).lean();
  // Recupera un documento de la colección `Service` cuyo campo `id` coincida con el valor proporcionado. Devuelve el documento como un objeto plano o `null` si no se encuentra.
}

export async function addService(serviceData: Omit<Service, 'id'>): Promise<Service> {
  const newId = serviceData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  // Genera un nuevo `id` único basado en el título del servicio (convertido a minúsculas y con espacios reemplazados por guiones) y la marca de tiempo actual.
  const newService = new ServiceModel({ ...serviceData, id: newId });
  // Crea una nueva instancia del modelo `ServiceModel` con los datos proporcionados y el `id` generado.
  await newService.save();
  // Guarda el nuevo servicio en la base de datos.
  console.log('Servicio Añadido:', newService);
  // Imprime un mensaje en la consola indicando que el servicio ha sido añadido.
  return newService.toObject();
  // Devuelve el servicio recién creado como un objeto plano.
}

export async function updateService(id: string, updateData: Partial<Omit<Service, 'id'>>): Promise<Service | null> {
  const updatedService = await ServiceModel.findOneAndUpdate({ id }, updateData, { new: true }).lean();
  // Busca un servicio por su `id` y actualiza los campos proporcionados en `updateData`. Devuelve el documento actualizado como un objeto plano o `null` si no se encuentra.
  if (updatedService) {
    console.log('Servicio Actualizado:', updatedService);
    // Si se encuentra y actualiza el servicio, imprime un mensaje en la consola.
  }
  return updatedService;
  // Devuelve el servicio actualizado o `null` si no se encontró.
}

export async function deleteService(id: string): Promise<boolean> {
  const result = await ServiceModel.deleteOne({ id });
  // Elimina un documento de la colección `Service` cuyo campo `id` coincida con el valor proporcionado.
  if (result.deletedCount > 0) {
    console.log('Servicio Eliminado con ID:', id);
    // Si se eliminó un documento, imprime un mensaje en la consola.
    return true;
    // Devuelve `true` indicando que la eliminación fue exitosa.
  }
  return false;
  // Devuelve `false` si no se eliminó ningún documento.
}

// --- Funciones de Fotos ---
export async function getPhotos(): Promise<GalleryPhoto[]> {
  return await PhotoModel.find().lean();
  // Recupera todos los documentos de la colección `GalleryPhoto` y los devuelve como objetos planos.
}

export async function getPhotoById(id: string): Promise<GalleryPhoto | null> {
  return await PhotoModel.findOne({ id }).lean();
  // Recupera un documento de la colección `GalleryPhoto` cuyo campo `id` coincida con el valor proporcionado. Devuelve el documento como un objeto plano o `null` si no se encuentra.
}

export async function addPhoto(photoData: Omit<GalleryPhoto, 'id'>): Promise<GalleryPhoto> {
  const newId = 'photo-' + Date.now();
  // Genera un nuevo `id` único basado en la marca de tiempo actual.
  if (!photoData.src || typeof photoData.src !== 'string' || !photoData.src.startsWith('http')) {
    throw new Error('URL de origen de foto inválida proporcionada.');
    // Lanza un error si el campo `src` no es válido (no es una URL o no comienza con "http").
  }
  const newPhoto = new PhotoModel({ ...photoData, id: newId });
  // Crea una nueva instancia del modelo `PhotoModel` con los datos proporcionados y el `id` generado.
  await newPhoto.save();
  // Guarda la nueva foto en la base de datos.
  console.log('Foto Añadida:', newPhoto);
  // Imprime un mensaje en la consola indicando que la foto ha sido añadida.
  return newPhoto.toObject();
  // Devuelve la foto recién creada como un objeto plano.
}

export async function updatePhoto(id: string, updateData: Partial<Omit<GalleryPhoto, 'id'>>): Promise<GalleryPhoto | null> {
  if (updateData.src && (typeof updateData.src !== 'string' || !updateData.src.startsWith('http'))) {
    throw new Error('URL de origen de foto inválida proporcionada para la actualización.');
    // Lanza un error si el campo `src` proporcionado para la actualización no es válido.
  }
  const updatedPhoto = await PhotoModel.findOneAndUpdate({ id }, updateData, { new: true }).lean();
  // Busca una foto por su `id` y actualiza los campos proporcionados en `updateData`. Devuelve el documento actualizado como un objeto plano o `null` si no se encuentra.
  if (updatedPhoto) {
    console.log('Foto Actualizada:', updatedPhoto);
    // Si se encuentra y actualiza la foto, imprime un mensaje en la consola.
  }
  return updatedPhoto;
  // Devuelve la foto actualizada o `null` si no se encontró.
}

export async function deletePhoto(id: string): Promise<boolean> {
  const result = await PhotoModel.deleteOne({ id });
  // Elimina un documento de la colección `GalleryPhoto` cuyo campo `id` coincida con el valor proporcionado.
  if (result.deletedCount > 0) {
    console.log('Foto Eliminada con ID:', id);
    // Si se eliminó un documento, imprime un mensaje en la consola.
    return true;
    // Devuelve `true` indicando que la eliminación fue exitosa.
  }
  return false;
  // Devuelve `false` si no se eliminó ningún documento.
}