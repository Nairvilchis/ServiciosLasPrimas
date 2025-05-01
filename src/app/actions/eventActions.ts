'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  addService,
  addPhoto,
  deleteService,
  updateService,
  deletePhoto,
  updatePhoto
} from '@/services/eventData';
import type { Service, GalleryPhoto } from '@/lib/types';

// --- Zod Schemas for Input Validation ---

const ServiceInputSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  iconName: z.string().min(1, "Se requiere el nombre del ícono."), // Simple validation for now
  image: z.string().url("La imagen debe ser una URL válida."),
  aiHint: z.string().optional().default(""),
});

// Schema for updating a service (allows partial updates)
const ServiceUpdateSchema = ServiceInputSchema.partial();

const PhotoInputSchema = z.object({
  src: z.string().url("La fuente debe ser una URL válida."),
  alt: z.string().min(3, "El texto alternativo debe tener al menos 3 caracteres."),
  aiHint: z.string().optional().default(""),
});

// Schema for updating a photo (allows partial updates)
const PhotoUpdateSchema = PhotoInputSchema.partial();


// --- Server Actions ---

/**
 * Server Action to add a new service.
 * Validates input and calls the data service function.
 * Revalidates the home page and services admin page paths.
 */
export async function addServiceAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = ServiceInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Añadir Servicio):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos.",
    };
  }

  try {
    const newService = await addService(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/#services');
    revalidatePath('/admin/services'); // Revalidate the admin list page
    return { success: true, data: newService, message: "Servicio añadido con éxito." };
  } catch (error) {
    console.error("Error al añadir servicio:", error);
    return { success: false, message: "Error al añadir el servicio." };
  }
}

/**
 * Server Action to update an existing service.
 * Validates input and calls the data service function.
 * Revalidates the home page and services admin page paths.
 */
export async function updateServiceAction(id: string, formData: FormData) {
  if (!id) {
     return { success: false, message: "Se requiere el ID del servicio para actualizar." };
  }
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = ServiceUpdateSchema.safeParse(rawData);

   if (!validatedFields.success) {
     console.error("Error de Validación (Actualizar Servicio):", validatedFields.error.flatten().fieldErrors);
     return {
       success: false,
       errors: validatedFields.error.flatten().fieldErrors,
       message: "Validación fallida. Por favor, revisa los campos.",
     };
   }

   // Ensure at least one field is being updated (though the service function handles empty updates)
   if (Object.keys(validatedFields.data).length === 0) {
        return { success: false, message: "No se enviaron cambios para actualizar." };
   }

  try {
    const updatedService = await updateService(id, validatedFields.data);
    if (!updatedService) {
        return { success: false, message: `Servicio con ID ${id} no encontrado.` };
    }
    revalidatePath('/');
    revalidatePath('/#services');
    revalidatePath('/admin/services');
    revalidatePath(`/admin/edit-service/${id}`); // Revalidate the edit page itself
    return { success: true, data: updatedService, message: "Servicio actualizado con éxito." };
  } catch (error) {
    console.error(`Error al actualizar servicio ${id}:`, error);
    return { success: false, message: "Error al actualizar el servicio." };
  }
}

/**
 * Server Action to delete a service.
 * Calls the data service function.
 * Revalidates the home page and services admin page paths.
 */
export async function deleteServiceAction(id: string) {
   if (!id) {
     return { success: false, message: "Se requiere el ID del servicio para eliminar." };
   }
  try {
    const deleted = await deleteService(id);
    if (!deleted) {
       return { success: false, message: `Servicio con ID ${id} no encontrado o no se pudo eliminar.` };
    }
    revalidatePath('/');
    revalidatePath('/#services');
    revalidatePath('/admin/services');
    return { success: true, message: "Servicio eliminado con éxito." };
  } catch (error) {
    console.error(`Error al eliminar servicio ${id}:`, error);
    return { success: false, message: "Error al eliminar el servicio." };
  }
}


/**
 * Server Action to add a new photo to the gallery.
 * Validates input and calls the data service function.
 * Revalidates the home page and gallery admin page paths.
 */
export async function addPhotoAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = PhotoInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Añadir Foto):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos.",
    };
  }

  try {
    const newPhoto = await addPhoto(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/#gallery');
    revalidatePath('/admin/gallery'); // Revalidate the admin list page
    return { success: true, data: newPhoto, message: "Foto añadida con éxito." };
  } catch (error) {
    console.error("Error al añadir foto:", error);
     const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return { success: false, message: `Error al añadir la foto: ${errorMessage}` };
  }
}


/**
 * Server Action to update an existing photo.
 * Validates input and calls the data service function.
 * Revalidates the home page and gallery admin page paths.
 */
export async function updatePhotoAction(id: string, formData: FormData) {
  if (!id) {
     return { success: false, message: "Se requiere el ID de la foto para actualizar." };
  }
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = PhotoUpdateSchema.safeParse(rawData);

   if (!validatedFields.success) {
     console.error("Error de Validación (Actualizar Foto):", validatedFields.error.flatten().fieldErrors);
     return {
       success: false,
       errors: validatedFields.error.flatten().fieldErrors,
       message: "Validación fallida. Por favor, revisa los campos.",
     };
   }

    // Ensure at least one field is being updated
   if (Object.keys(validatedFields.data).length === 0) {
        return { success: false, message: "No se enviaron cambios para actualizar." };
   }

  try {
    const updatedPhoto = await updatePhoto(id, validatedFields.data);
     if (!updatedPhoto) {
        return { success: false, message: `Foto con ID ${id} no encontrada.` };
     }
    revalidatePath('/');
    revalidatePath('/#gallery');
    revalidatePath('/admin/gallery');
    revalidatePath(`/admin/edit-photo/${id}`); // Revalidate edit page
    return { success: true, data: updatedPhoto, message: "Foto actualizada con éxito." };
  } catch (error) {
    console.error(`Error al actualizar foto ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return { success: false, message: `Error al actualizar la foto: ${errorMessage}` };
  }
}

/**
 * Server Action to delete a photo.
 * Calls the data service function.
 * Revalidates the home page and gallery admin page paths.
 */
export async function deletePhotoAction(id: string) {
  if (!id) {
    return { success: false, message: "Se requiere el ID de la foto para eliminar." };
  }
  try {
    const deleted = await deletePhoto(id);
    if (!deleted) {
       return { success: false, message: `Foto con ID ${id} no encontrada o no se pudo eliminar.` };
    }
    revalidatePath('/');
    revalidatePath('/#gallery');
    revalidatePath('/admin/gallery');
    return { success: true, message: "Foto eliminada con éxito." };
  } catch (error) {
    console.error(`Error al eliminar foto ${id}:`, error);
    return { success: false, message: "Error al eliminar la foto." };
  }
}
