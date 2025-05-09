// Indica que este archivo se ejecuta en el servidor. Esto es relevante en frameworks como Next.js para diferenciar entre código del cliente y del servidor.
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  addService,
  addPhoto,
  deleteService,
  updateService,
  deletePhoto,
  updatePhoto,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  addQuote, // Import addQuote
} from '@/services/eventData';
import type { Service, GalleryPhoto, CalendarEvent, Quote } from '@/lib/types';

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

const CalendarEventInputSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  startDateTime: z.coerce.date({ required_error: "La fecha y hora de inicio son requeridas."}),
  endDateTime: z.coerce.date().optional(),
  description: z.string().optional(),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  servicesInvolved: z.array(z.string()).optional(),
  allDay: z.boolean().optional().default(false),
});

const CalendarEventUpdateSchema = CalendarEventInputSchema.partial();

// Zod schema for Quote submissions
const QuoteInputSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingresa un correo electrónico válido." }),
  phone: z.string().optional(),
  eventDate: z.string().optional(), // Stays as string, can be converted later if needed
  services: z.array(z.string()).min(1, { message: "Debes seleccionar al menos un servicio." }),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
  otherServiceDetail: z.string().optional(),
});


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

// --- Server Actions for Calendar Events ---
export async function addCalendarEventAction(formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    startDateTime: formData.get('startDateTime'),
    endDateTime: formData.get('endDateTime') || undefined, // Handle empty string for optional date
    description: formData.get('description') || undefined,
    clientName: formData.get('clientName') || undefined,
    clientContact: formData.get('clientContact') || undefined,
    servicesInvolved: formData.getAll('servicesInvolved').filter(Boolean), // Filter out empty strings if any
    allDay: formData.get('allDay') === 'on' || formData.get('allDay') === 'true',
  };

  const validatedFields = CalendarEventInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Añadir Evento):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos del evento.",
    };
  }

  try {
    const newEvent = await addCalendarEvent(validatedFields.data);
    revalidatePath('/admin/agenda');
    revalidatePath('/admin/quotes'); // Revalidate quotes page as well
    return { success: true, data: newEvent, message: "Evento añadido con éxito." };
  } catch (error) {
    console.error("Error al añadir evento:", error);
    return { success: false, message: "Error al añadir el evento." };
  }
}

export async function updateCalendarEventAction(id: string, formData: FormData) {
  if (!id) {
    return { success: false, message: "Se requiere el ID del evento para actualizar." };
  }
 const rawData = {
    title: formData.get('title'),
    startDateTime: formData.get('startDateTime'),
    endDateTime: formData.get('endDateTime') || undefined,
    description: formData.get('description') || undefined,
    clientName: formData.get('clientName') || undefined,
    clientContact: formData.get('clientContact') || undefined,
    servicesInvolved: formData.getAll('servicesInvolved').filter(Boolean),
    allDay: formData.get('allDay') === 'on' || formData.get('allDay') === 'true',
  };


  // Filter out undefined values so they don't overwrite existing fields if not provided
  const updateData: any = {};
  if (rawData.title) updateData.title = rawData.title;
  if (rawData.startDateTime) updateData.startDateTime = rawData.startDateTime;
  if (rawData.endDateTime) updateData.endDateTime = rawData.endDateTime;
  if (rawData.description) updateData.description = rawData.description;
  if (rawData.clientName) updateData.clientName = rawData.clientName;
  if (rawData.clientContact) updateData.clientContact = rawData.clientContact;
  if (rawData.servicesInvolved && rawData.servicesInvolved.length > 0) updateData.servicesInvolved = rawData.servicesInvolved;
  // allDay is boolean, send it if it changed
  if (formData.has('allDay')) updateData.allDay = rawData.allDay;


  const validatedFields = CalendarEventUpdateSchema.safeParse(updateData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Actualizar Evento):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos del evento.",
    };
  }
  if (Object.keys(validatedFields.data).length === 0) {
    return { success: false, message: "No se enviaron cambios para actualizar." };
  }

  try {
    const updatedEvent = await updateCalendarEvent(id, validatedFields.data);
    if (!updatedEvent) {
      return { success: false, message: `Evento con ID ${id} no encontrado.` };
    }
    revalidatePath('/admin/agenda');
    return { success: true, data: updatedEvent, message: "Evento actualizado con éxito." };
  } catch (error) {
    console.error(`Error al actualizar evento ${id}:`, error);
    return { success: false, message: "Error al actualizar el evento." };
  }
}

export async function deleteCalendarEventAction(id: string) {
  if (!id) {
    return { success: false, message: "Se requiere el ID del evento para eliminar." };
  }
  try {
    const deleted = await deleteCalendarEvent(id);
    if (!deleted) {
      return { success: false, message: `Evento con ID ${id} no encontrado o no se pudo eliminar.` };
    }
    revalidatePath('/admin/agenda');
    return { success: true, message: "Evento eliminado con éxito." };
  } catch (error) {
    console.error(`Error al eliminar evento ${id}:`, error);
    return { success: false, message: "Error al eliminar el evento." };
  }
}

// --- Server Action for Quotes ---
export async function addQuoteAction(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string || undefined,
    eventDate: formData.get('eventDate') as string || undefined,
    services: formData.getAll('services') as string[],
    message: formData.get('message') as string,
    otherServiceDetail: formData.get('otherServiceDetail') as string || undefined,
  };

  const validatedFields = QuoteInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Añadir Cotización):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos de la cotización.",
    };
  }

  try {
    const newQuote = await addQuote(validatedFields.data);
    revalidatePath('/admin/quotes'); // Revalidate the quotes admin page
    return { success: true, data: newQuote, message: "Cotización enviada con éxito." };
  } catch (error) {
    console.error("Error al añadir cotización:", error);
    return { success: false, message: "Error al enviar la cotización." };
  }
}
