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
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  iconName: z.string().min(1, "Icon name is required."), // Simple validation for now
  image: z.string().url("Image must be a valid URL."),
  aiHint: z.string().optional().default(""),
});

// Schema for updating a service (allows partial updates)
const ServiceUpdateSchema = ServiceInputSchema.partial();

const PhotoInputSchema = z.object({
  src: z.string().url("Source must be a valid URL."),
  alt: z.string().min(3, "Alt text must be at least 3 characters."),
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
    console.error("Validation Error (Add Service):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the fields.",
    };
  }

  try {
    const newService = await addService(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/#services');
    revalidatePath('/admin/services'); // Revalidate the admin list page
    return { success: true, data: newService, message: "Service added successfully." };
  } catch (error) {
    console.error("Error adding service:", error);
    return { success: false, message: "Failed to add service." };
  }
}

/**
 * Server Action to update an existing service.
 * Validates input and calls the data service function.
 * Revalidates the home page and services admin page paths.
 */
export async function updateServiceAction(id: string, formData: FormData) {
  if (!id) {
     return { success: false, message: "Service ID is required for update." };
  }
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = ServiceUpdateSchema.safeParse(rawData);

   if (!validatedFields.success) {
     console.error("Validation Error (Update Service):", validatedFields.error.flatten().fieldErrors);
     return {
       success: false,
       errors: validatedFields.error.flatten().fieldErrors,
       message: "Validation failed. Please check the fields.",
     };
   }

   // Ensure at least one field is being updated (though the service function handles empty updates)
   if (Object.keys(validatedFields.data).length === 0) {
        return { success: false, message: "No changes submitted for update." };
   }

  try {
    const updatedService = await updateService(id, validatedFields.data);
    if (!updatedService) {
        return { success: false, message: `Service with ID ${id} not found.` };
    }
    revalidatePath('/');
    revalidatePath('/#services');
    revalidatePath('/admin/services');
    revalidatePath(`/admin/edit-service/${id}`); // Revalidate the edit page itself
    return { success: true, data: updatedService, message: "Service updated successfully." };
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    return { success: false, message: "Failed to update service." };
  }
}

/**
 * Server Action to delete a service.
 * Calls the data service function.
 * Revalidates the home page and services admin page paths.
 */
export async function deleteServiceAction(id: string) {
   if (!id) {
     return { success: false, message: "Service ID is required for deletion." };
   }
  try {
    const deleted = await deleteService(id);
    if (!deleted) {
       return { success: false, message: `Service with ID ${id} not found or could not be deleted.` };
    }
    revalidatePath('/');
    revalidatePath('/#services');
    revalidatePath('/admin/services');
    return { success: true, message: "Service deleted successfully." };
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    return { success: false, message: "Failed to delete service." };
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
    console.error("Validation Error (Add Photo):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the fields.",
    };
  }

  try {
    const newPhoto = await addPhoto(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/#gallery');
    revalidatePath('/admin/gallery'); // Revalidate the admin list page
    return { success: true, data: newPhoto, message: "Photo added successfully." };
  } catch (error) {
    console.error("Error adding photo:", error);
     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to add photo: ${errorMessage}` };
  }
}


/**
 * Server Action to update an existing photo.
 * Validates input and calls the data service function.
 * Revalidates the home page and gallery admin page paths.
 */
export async function updatePhotoAction(id: string, formData: FormData) {
  if (!id) {
     return { success: false, message: "Photo ID is required for update." };
  }
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = PhotoUpdateSchema.safeParse(rawData);

   if (!validatedFields.success) {
     console.error("Validation Error (Update Photo):", validatedFields.error.flatten().fieldErrors);
     return {
       success: false,
       errors: validatedFields.error.flatten().fieldErrors,
       message: "Validation failed. Please check the fields.",
     };
   }

    // Ensure at least one field is being updated
   if (Object.keys(validatedFields.data).length === 0) {
        return { success: false, message: "No changes submitted for update." };
   }

  try {
    const updatedPhoto = await updatePhoto(id, validatedFields.data);
     if (!updatedPhoto) {
        return { success: false, message: `Photo with ID ${id} not found.` };
     }
    revalidatePath('/');
    revalidatePath('/#gallery');
    revalidatePath('/admin/gallery');
    revalidatePath(`/admin/edit-photo/${id}`); // Revalidate edit page
    return { success: true, data: updatedPhoto, message: "Photo updated successfully." };
  } catch (error) {
    console.error(`Error updating photo ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to update photo: ${errorMessage}` };
  }
}

/**
 * Server Action to delete a photo.
 * Calls the data service function.
 * Revalidates the home page and gallery admin page paths.
 */
export async function deletePhotoAction(id: string) {
  if (!id) {
    return { success: false, message: "Photo ID is required for deletion." };
  }
  try {
    const deleted = await deletePhoto(id);
    if (!deleted) {
       return { success: false, message: `Photo with ID ${id} not found or could not be deleted.` };
    }
    revalidatePath('/');
    revalidatePath('/#gallery');
    revalidatePath('/admin/gallery');
    return { success: true, message: "Photo deleted successfully." };
  } catch (error) {
    console.error(`Error deleting photo ${id}:`, error);
    return { success: false, message: "Failed to delete photo." };
  }
}
