'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addService, addPhoto } from '@/services/eventData';
import type { Service, GalleryPhoto } from '@/lib/types';

// --- Zod Schemas for Input Validation ---

const ServiceInputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  iconName: z.string().min(1, "Icon name is required."), // Simple validation for now
  image: z.string().url("Image must be a valid URL."),
  aiHint: z.string().optional().default(""),
});

const PhotoInputSchema = z.object({
  src: z.string().url("Source must be a valid URL."),
  alt: z.string().min(3, "Alt text must be at least 3 characters."),
  aiHint: z.string().optional().default(""),
});


// --- Server Actions ---

/**
 * Server Action to add a new service.
 * Validates input and calls the data service function.
 * Revalidates the home page path to reflect changes.
 */
export async function addServiceAction(formData: FormData) {
  // Use Object.fromEntries for simpler extraction
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = ServiceInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation Error (Service):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the fields.",
    };
  }

  try {
    const newService = await addService(validatedFields.data);
    revalidatePath('/'); // Revalidate the home page
     revalidatePath('/#services'); // Try revalidating with hash
    return { success: true, data: newService, message: "Service added successfully." };
  } catch (error) {
    console.error("Error adding service:", error);
    return { success: false, message: "Failed to add service." };
  }
}

/**
 * Server Action to add a new photo to the gallery.
 * Validates input and calls the data service function.
 * Revalidates the home page path to reflect changes.
 */
export async function addPhotoAction(formData: FormData) {
   // Use Object.fromEntries for simpler extraction
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = PhotoInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation Error (Photo):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the fields.",
    };
  }

  try {
    const newPhoto = await addPhoto(validatedFields.data);
    revalidatePath('/'); // Revalidate the home page
    revalidatePath('/#gallery'); // Try revalidating with hash
    return { success: true, data: newPhoto, message: "Photo added successfully." };
  } catch (error) {
    console.error("Error adding photo:", error);
     // Check if error is an instance of Error to access message property safely
     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to add photo: ${errorMessage}` };
  }
}
